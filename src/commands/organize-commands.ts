import chalk from "chalk";
import { DirectoryManager } from "../utils/directory-manager";
import { FileParser } from "../utils/file-parser";
import { AnimeValidator } from "../services/anime-validator";
import { InteractiveUtils } from "../utils/interactive";
import { OrganizeOptions, OrganizeResult, FileClassification, AnimeMatch } from "../types/organize";

export class OrganizeCommands {
  static async organizeAnimeFiles(options: OrganizeOptions): Promise<void> {
    console.log(chalk.cyan('🎌 JIKAN CLI - ANIME AUTO-ORGANIZATION'));
    console.log(chalk.cyan('═'.repeat(50)));
    console.log();

    try {
      // Source directory validation
      console.log(chalk.blue('📂 Validating source directory...'));
      const pathValidation = await DirectoryManager.validatePath(options.sourceDirectory);
      if (!pathValidation.valid) {
        console.log(chalk.red(`❌ ${pathValidation.error}`));
        process.exit(1);
      }
      console.log(chalk.green(`✅ Valid directory: ${options.sourceDirectory}`));
      console.log();

      // Scan video files
      console.log(chalk.blue('🔍 Scanning for video files...'));
      const videoFiles = await DirectoryManager.scanDirectory(
        options.sourceDirectory,
        options.videoExtensions
      );
      
      if (videoFiles.length === 0) {
        console.log(chalk.yellow('⚠️  No video files found in the specified directory.'));
        process.exit(0);
      }

      console.log(chalk.green(`✅ ${videoFiles.length} video files found`));
      console.log();

      // File classification
      console.log(chalk.blue('🎯 Classifying files...'));
      const classifications = FileParser.batchClassifyFiles(videoFiles);
      
      this.displayClassificationSummary(classifications);

      // Filter only potential anime files
      const animeFiles = videoFiles.filter((_, index) => 
        classifications[index].type === 'anime'
      );

      if (animeFiles.length === 0) {
        console.log(chalk.yellow('⚠️  No anime files detected.'));
        this.displaySuggestionsForUnknownFiles(classifications);
        process.exit(0);
      }

      // Parse anime files
      console.log(chalk.blue('📋 Analyzing file names...'));
      const parsedFiles = FileParser.batchParseAnimeFiles(animeFiles);
      
      if (parsedFiles.length === 0) {
        console.log(chalk.red('❌ Unable to analyze files detected as anime.'));
        process.exit(1);
      }

      console.log(chalk.green(`✅ ${parsedFiles.length} files analyzed successfully`));
      console.log();

      // Validation with Jikan API
      console.log(chalk.blue('🌐 Validating with Jikan API...'));
      console.log(chalk.gray('   (This may take a few minutes depending on the number of files)'));
      
      let { animeMatches, otherFiles } = await AnimeValidator.validateBatch(parsedFiles);
      
      console.log(chalk.green(`✅ API validation completed`));
      console.log(chalk.green(`   📺 Anime files confirmed: ${animeMatches.length}`));
      if (otherFiles.length > 0) {
        console.log(chalk.yellow(`   📄 Other files (not anime): ${otherFiles.length}`));
      }
      console.log();

      if (animeMatches.length === 0) {
        console.log(chalk.yellow('⚠️  No anime files confirmed by API.'));
        if (otherFiles.length > 0) {
          console.log(chalk.gray(`   ${otherFiles.length} files were not recognized as anime:`));
          otherFiles.slice(0, 5).forEach(file => {
            console.log(chalk.gray(`   - ${file.fileName}`));
          });
          if (otherFiles.length > 5) {
            console.log(chalk.gray(`   ... and ${otherFiles.length - 5} more`));
          }
        }
        process.exit(0);
      }

      // Interactive mode for review and recovery
      if (options.interactive) {
        let finalMatches = animeMatches;
        let remainingOtherFiles = otherFiles;

        // Show main review first
        const shouldContinue = await this.showInteractiveReview(finalMatches, options);
        if (!shouldContinue) {
          console.log(chalk.cyan('👋 Operation cancelled by user.'));
          process.exit(0);
        }

        // Offer recovery of skipped files if any exist
        if (remainingOtherFiles.length > 0) {
          const recoveredFiles = await InteractiveUtils.selectSkippedFilesToRecover(remainingOtherFiles);
          
          if (recoveredFiles.length > 0) {
            console.log(chalk.blue(`\n🔄 Attempting to recover ${recoveredFiles.length} selected file(s)...`));
            
            const { newMatches, stillSkipped } = await AnimeValidator.recoverAndGroupSkippedFiles(
              recoveredFiles, 
              finalMatches
            );
            
            if (newMatches.length > 0) {
              finalMatches = [...finalMatches, ...newMatches];
              console.log(chalk.green(`✅ Successfully recovered ${newMatches.length} file(s) as anime!`));
              
              // Update remaining other files
              remainingOtherFiles = remainingOtherFiles.filter(f => 
                !recoveredFiles.includes(f) || stillSkipped.includes(f)
              );
              remainingOtherFiles.push(...stillSkipped);
            }
            
            if (stillSkipped.length > 0) {
              console.log(chalk.yellow(`⚠️  ${stillSkipped.length} file(s) still not confirmed as anime`));
            }
          }
        }

        // Update the matches for final organization
        animeMatches = finalMatches;
      }

      // Display preview
      if (options.preview) {
        this.displayPreview(animeMatches, options);
        process.exit(0);
      }

      // Final confirmation before organization
      if (!options.interactive) {
        const preview = DirectoryManager.generatePreviewReport(animeMatches, options);
        console.log(preview);
        
        // Ask for confirmation (unless --force is specified)
        const confirmed = await InteractiveUtils.confirmAction(
          'Do you want to proceed with organizing these files?'
        );
        
        if (!confirmed) {
          console.log(chalk.cyan('👋 Operation cancelled.'));
          process.exit(0);
        }
      }

      // File organization
      console.log(chalk.blue('📁 Organizing files in progress...'));
      const result = await DirectoryManager.organizeFiles(animeMatches, options);
      
      this.displayOrganizeResult(result, options);

    } catch (error) {
      console.error(chalk.red('❌ Error during organization:'), error);
      process.exit(1);
    }
  }

  private static displayClassificationSummary(classifications: FileClassification[]): void {
    const summary = classifications.reduce((acc, classification) => {
      acc[classification.type] = (acc[classification.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(chalk.gray('   Initial classification (will be validated by API):'));
    
    const typeIcons: Record<string, string> = {
      anime: '📺',
      other: '📄'
    };

    for (const [type, count] of Object.entries(summary)) {
      const icon = typeIcons[type] || '📄';
      const color = type === 'anime' ? chalk.green : chalk.gray;
      console.log(color(`   ${icon} ${type}: ${count} file(s)`));
    }
    console.log();
  }

  private static displaySuggestionsForUnknownFiles(classifications: FileClassification[]): void {
    const unknownFiles = classifications
      .filter(c => c.type === 'other')
      .slice(0, 5); // Montrer seulement les 5 premiers

    if (unknownFiles.length > 0) {
      console.log(chalk.yellow('\n💡 Suggestions for unrecognized files:'));
      console.log(chalk.gray('   These files were not recognized as anime:'));
      
      for (const file of unknownFiles) {
        console.log(chalk.gray(`   • ${file.file} (${file.reason})`));
      }
      
      if (classifications.filter(c => c.type === 'other').length > 5) {
        const remaining = classifications.filter(c => c.type === 'other').length - 5;
        console.log(chalk.gray(`   ... and ${remaining} other file(s)`));
      }

      console.log(chalk.cyan('\n   Tips:'));
      console.log(chalk.cyan('   • Check that file names contain the anime name'));
      console.log(chalk.cyan('   • Make sure episodes are numbered'));
      console.log(chalk.cyan('   • Use --min-confidence to adjust detection'));
    }
  }

  private static async showInteractiveReview(
    matches: AnimeMatch[],
    options: OrganizeOptions
  ): Promise<boolean> {
    console.log(chalk.cyan('🎮 Interactive mode - Review matches'));
    console.log(chalk.gray('   Review found matches before organization'));
    console.log();

    const minConfidence = options.minConfidence || 70;
    const lowConfidenceMatches = matches.filter(m => m.parsedFile.confidence < minConfidence);
    const goodMatches = matches.filter(m => m.parsedFile.confidence >= minConfidence);

    // Display good matches
    if (goodMatches.length > 0) {
      console.log(chalk.green(`✅ ${goodMatches.length} matches with high confidence (≥${minConfidence}%)`));
      
      const showGood = await InteractiveUtils.confirmAction('View details of good matches?');
      if (showGood) {
        this.displayMatchDetails(goodMatches.slice(0, 10)); // Show first 10
      }
    }

    // Display questionable matches
    if (lowConfidenceMatches.length > 0) {
      console.log(chalk.yellow(`⚠️  ${lowConfidenceMatches.length} matches with low confidence (<${minConfidence}%)`));
      
      const showLow = options.adjustConfidence || await InteractiveUtils.confirmAction('View questionable matches?');
      if (showLow) {
        this.displayMatchDetails(lowConfidenceMatches);
        
        const adjustConfidence = options.adjustConfidence || await InteractiveUtils.confirmAction(
          'Would you like to adjust confidence settings?'
        );
        
        if (adjustConfidence) {
          const adjustmentResult = await InteractiveUtils.adjustConfidenceInteractive(matches);
          
          // Update options with new threshold
          if (adjustmentResult.newThreshold !== options.minConfidence) {
            console.log(chalk.green(`✅ Updated minimum confidence threshold to ${adjustmentResult.newThreshold}%`));
            options.minConfidence = adjustmentResult.newThreshold;
          }
          
          // Use adjusted matches
          matches.splice(0, matches.length, ...adjustmentResult.adjustedMatches);
          
          // Recalculate good/low confidence matches with new settings
          const newMinConfidence = options.minConfidence || 70;
          const newLowConfidenceMatches = matches.filter(m => m.parsedFile.confidence < newMinConfidence);
          const newGoodMatches = matches.filter(m => m.parsedFile.confidence >= newMinConfidence);
          
          console.log(chalk.blue(`\n📊 Updated Statistics (threshold: ${newMinConfidence}%):`));
          console.log(chalk.green(`   ✅ High confidence: ${newGoodMatches.length} files`));
          console.log(chalk.yellow(`   ⚠️  Low confidence: ${newLowConfidenceMatches.length} files\n`));
        }
      }
    } else if (options.adjustConfidence && goodMatches.length > 0) {
      // Even if all matches have good confidence, still offer adjustment if flag is set
      console.log(chalk.green(`✅ All ${goodMatches.length} matches have good confidence (≥${minConfidence}%)`));
      
      const stillAdjust = await InteractiveUtils.confirmAction('Still want to review confidence settings?');
      if (stillAdjust) {
        const adjustmentResult = await InteractiveUtils.adjustConfidenceInteractive(matches);
        
        // Update options with new threshold
        if (adjustmentResult.newThreshold !== options.minConfidence) {
          console.log(chalk.green(`✅ Updated minimum confidence threshold to ${adjustmentResult.newThreshold}%`));
          options.minConfidence = adjustmentResult.newThreshold;
        }
        
        // Use adjusted matches
        matches.splice(0, matches.length, ...adjustmentResult.adjustedMatches);
        
        // Recalculate statistics
        const newMinConfidence = options.minConfidence || 70;
        const newLowConfidenceMatches = matches.filter(m => m.parsedFile.confidence < newMinConfidence);
        const newGoodMatches = matches.filter(m => m.parsedFile.confidence >= newMinConfidence);
        
        console.log(chalk.blue(`\n📊 Final Statistics (threshold: ${newMinConfidence}%):`));
        console.log(chalk.green(`   ✅ High confidence: ${newGoodMatches.length} files`));
        console.log(chalk.yellow(`   ⚠️  Low confidence: ${newLowConfidenceMatches.length} files\n`));
      }
    }

    return await InteractiveUtils.confirmAction(
      `Proceed with organizing ${goodMatches.length} files?`
    );
  }

  private static displayMatchDetails(matches: AnimeMatch[]): void {
    console.log();
    for (const match of matches.slice(0, 10)) {
      const confidence = match.parsedFile.confidence;
      const confidenceColor = confidence >= 90 ? chalk.green : 
                            confidence >= 80 ? chalk.yellow : chalk.red;
      
      console.log(`${confidenceColor(`[${confidence}%]`)} ${match.parsedFile.fileName}`);
      console.log(chalk.gray(`   → ${match.normalizedName}`));
      
      if (match.jikanData) {
        console.log(chalk.gray(`   📺 ${match.jikanData.title} (${match.jikanData.year})`));
        if (match.jikanData.title_english && match.jikanData.title_english !== match.jikanData.title) {
          console.log(chalk.gray(`   🔤 ${match.jikanData.title_english}`));
        }
      } else {
        console.log(chalk.gray('   ❓ No API match found'));
      }
      
      console.log(chalk.gray(`   📁 ${match.targetPath}/`));
      console.log();
    }
    
    if (matches.length > 10) {
      console.log(chalk.gray(`   ... and ${matches.length - 10} other match(es)`));
    }
  }

  private static displayPreview(matches: AnimeMatch[], options: OrganizeOptions): void {
    const report = DirectoryManager.generatePreviewReport(matches, options);
    console.log(report);
    
    console.log(chalk.cyan('\n💡 To proceed with actual organization:'));
    console.log(chalk.cyan(`   jikan-cli --organize "${options.sourceDirectory}" --interactive`));
    console.log(chalk.cyan(`   (without the --preview flag)`));
  }

  private static displayOrganizeResult(result: OrganizeResult, options: OrganizeOptions): void {
    console.log();
    console.log(chalk.cyan('📋 ORGANIZATION RESULT'));
    console.log(chalk.cyan('═'.repeat(40)));
    console.log();

    console.log(chalk.blue(`📊 Statistics:`));
    console.log(`   • Files processed: ${result.processed}`);
    console.log(chalk.green(`   • Files organized: ${result.organized}`));
    
    if (result.skipped > 0) {
      console.log(chalk.yellow(`   • Files skipped: ${result.skipped}`));
    }
    
    if (result.errors > 0) {
      console.log(chalk.red(`   • Errors: ${result.errors}`));
    }

    const successRate = result.processed > 0 ? 
      Math.round((result.organized / result.processed) * 100) : 0;
    console.log(`   • Success rate: ${successRate}%`);

    // Display skipped files
    if (result.skippedFiles.length > 0) {
      console.log(chalk.yellow('\n⚠️  Skipped files:'));
      for (const file of result.skippedFiles.slice(0, 5)) {
        console.log(chalk.gray(`   • ${file}`));
      }
      if (result.skippedFiles.length > 5) {
        console.log(chalk.gray(`   ... and ${result.skippedFiles.length - 5} other(s)`));
      }
    }

    // Display errors
    if (result.errorFiles.length > 0) {
      console.log(chalk.red('\n❌ Errors encountered:'));
      for (const error of result.errorFiles.slice(0, 3)) {
        console.log(chalk.red(`   • ${error.file}: ${error.error}`));
      }
      if (result.errorFiles.length > 3) {
        console.log(chalk.gray(`   ... and ${result.errorFiles.length - 3} other error(s)`));
      }
    }

    // Display target directory
    const targetDir = options.targetDirectory || `${options.sourceDirectory}/Organized`;
    console.log(chalk.cyan(`\n📁 Organization directory: ${targetDir}`));

    if (result.organized > 0) {
      console.log(chalk.green('\n🎉 Organization completed successfully!'));
      
      // Cleanup suggestions
      if (result.skipped > 0) {
        console.log(chalk.cyan('\n💡 Suggestions:'));
        console.log(chalk.cyan('   • Check skipped files manually'));
        console.log(chalk.cyan('   • Use --min-confidence with a lower value to include more files'));
        console.log(chalk.cyan('   • Rename unrecognized files according to supported patterns'));
      }
    } else {
      console.log(chalk.yellow('\n⚠️  No files were organized.'));
      console.log(chalk.cyan('💡 Check file names and confidence threshold.'));
    }
  }

  static async showOrganizeHelp(): Promise<void> {
    const helpText = `
${chalk.cyan('🎌 JIKAN CLI - ANIME AUTO-ORGANIZATION')}

${chalk.yellow('USAGE:')}
  jikan-cli --organize <directory> [OPTIONS]

${chalk.yellow('DESCRIPTION:')}
  Automatically organizes your anime files by creating a folder structure
  based on detected anime names and seasons.

${chalk.yellow('OPTIONS:')}
  --preview                    Show preview without moving files
  --interactive               Interactive mode with match review
  --target <directory>        Target directory (default: <source>/Organized)
  --min-confidence <0-100>    Minimum confidence threshold (default: 70)
  --adjust-confidence         Interactive confidence adjustment tool
  --handle-duplicates <mode>  skip|rename|overwrite (default: skip)

${chalk.yellow('EXAMPLES:')}
  ${chalk.green('# Organization preview')}
  jikan-cli --organize "./Downloads" --preview

  ${chalk.green('# Interactive organization')}
  jikan-cli --organize "./Downloads" --interactive

  ${chalk.green('# Organization with custom confidence threshold')}
  jikan-cli --organize "./Downloads" --min-confidence 60

  ${chalk.green('# Organization to specific directory')}
  jikan-cli --organize "./Downloads" --target "./Anime Library"

  ${chalk.green('# Interactive confidence adjustment')}
  jikan-cli --organize "./Downloads" --adjust-confidence

${chalk.yellow('SUPPORTED FILE FORMATS:')}
  ${chalk.gray('Extensions:')} .mp4, .mkv, .avi, .mov, .wmv, .flv, .webm, .ts, .m4v
  
  ${chalk.gray('Detected patterns:')}
  • Voiranime format: "Anime (VF) - Anime - 01 VF - 01 - Voiranime.mp4"
  • Abbreviated format: "SNK_S1_1_VF.mp4"  
  • Simple format: "Naruto.mp4"

${chalk.yellow('GENERATED STRUCTURE:')}
  Anime Library/
  ├── Naruto/
  │   ├── Season 1/
  │   │   ├── Naruto - S01E01 [VF].mp4
  │   │   └── Naruto - S01E02 [VF].mp4
  │   └── Season 2/
  └── Attack on Titan/
      └── Season 1/

${chalk.yellow('NOTES:')}
  • Anime names are validated via Jikan API (MyAnimeList)
  • Non-anime files (music, clips, etc.) are automatically ignored  
  • Intelligent scoring system evaluates detection confidence
  • Preview mode recommended before first use
`;
    console.log(helpText);
  }
}