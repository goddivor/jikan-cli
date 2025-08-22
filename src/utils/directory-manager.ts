import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { AnimeMatch, OrganizeOptions, OrganizeResult } from '../types/organize';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const rename = promisify(fs.rename);
const copyFile = promisify(fs.copyFile);
const access = promisify(fs.access);

export class DirectoryManager {
  private static readonly DEFAULT_VIDEO_EXTENSIONS = [
    '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.ts', '.m4v'
  ];

  static async scanDirectory(
    directoryPath: string,
    videoExtensions: string[] = this.DEFAULT_VIDEO_EXTENSIONS
  ): Promise<string[]> {
    try {
      await access(directoryPath, fs.constants.R_OK);
      const files = await readdir(directoryPath);
      const videoFiles: string[] = [];

      for (const file of files) {
        const filePath = path.join(directoryPath, file);
        try {
          const stats = await stat(filePath);
          
          if (stats.isFile()) {
            const ext = path.extname(file).toLowerCase();
            if (videoExtensions.includes(ext)) {
              videoFiles.push(filePath);
            }
          }
        } catch (error) {
          console.warn(`Unable to read file ${filePath}:`, error);
        }
      }

      return videoFiles.sort();
    } catch (error) {
      throw new Error(`Unable to scan directory ${directoryPath}: ${error}`);
    }
  }

  static async organizeFiles(
    matches: AnimeMatch[],
    options: OrganizeOptions
  ): Promise<OrganizeResult> {
    const result: OrganizeResult = {
      processed: 0,
      organized: 0,
      skipped: 0,
      errors: 0,
      matches: [],
      skippedFiles: [],
      errorFiles: []
    };

    const targetBase = options.targetDirectory || path.join(options.sourceDirectory, 'Organized');

    // Filter by minimum confidence
    const minConfidence = options.minConfidence || 70;
    const validMatches = matches.filter(match => match.parsedFile.confidence >= minConfidence);

    console.log(`📊 ${matches.length} files analyzed, ${validMatches.length} will be organized (confidence ≥ ${minConfidence}%)`);

    for (const match of matches) {
      result.processed++;

      try {
        if (match.parsedFile.confidence < minConfidence) {
          result.skipped++;
          result.skippedFiles.push(`${match.parsedFile.fileName} (confidence: ${match.parsedFile.confidence}%)`);
          continue;
        }

        if (options.preview) {
          // Mode preview : juste enregistrer ce qui serait fait
          result.organized++;
          result.matches.push(match);
        } else {
          // Actually organize the file
          const success = await this.moveFile(match, targetBase, options);
          if (success) {
            result.organized++;
            result.matches.push(match);
          } else {
            result.skipped++;
            result.skippedFiles.push(match.parsedFile.fileName);
          }
        }
      } catch (error) {
        result.errors++;
        result.errorFiles.push({
          file: match.parsedFile.fileName,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return result;
  }

  private static async moveFile(
    match: AnimeMatch,
    targetBase: string,
    options: OrganizeOptions
  ): Promise<boolean> {
    const sourcePath = match.parsedFile.originalPath;
    const targetDir = path.join(targetBase, match.targetPath);
    const fileName = match.parsedFile.fileName;
    
    // Generate a clean file name
    const cleanFileName = this.generateCleanFileName(match);
    const targetPath = path.join(targetDir, cleanFileName);

    try {
      // Create target directory if it doesn't exist
      await mkdir(targetDir, { recursive: true });

      // Check if target file already exists
      const targetExists = await this.fileExists(targetPath);
      
      if (targetExists) {
        return await this.handleDuplicate(sourcePath, targetPath, options.handleDuplicates);
      }

      // Move the file
      await rename(sourcePath, targetPath);
      console.log(`✅ Moved: ${fileName} → ${path.relative(targetBase, targetPath)}`);
      return true;

    } catch (error) {
      console.error(`❌ Error moving ${fileName}:`, error);
      return false;
    }
  }

  private static generateCleanFileName(match: AnimeMatch): string {
    const parsed = match.parsedFile;
    const ext = path.extname(parsed.fileName);
    
    // Format: "Anime Name - S01E05 [VF].mp4" (exact spacing as requested)
    let cleanName = match.normalizedName.replace(/[:<>"|?*]/g, '');
    
    // Always add season (default to S01 if not specified)
    const seasonNum = parsed.season || 1;
    cleanName += ` - S${seasonNum.toString().padStart(2, '0')}`;
    
    // Always add episode with proper padding
    if (parsed.episode) {
      cleanName += `E${parsed.episode.toString().padStart(2, '0')}`;
    } else {
      cleanName += `E01`; // Default episode if not found
    }
    
    // Add language if available, default to empty if not specified
    if (parsed.language) {
      const normalizedLang = parsed.language.toUpperCase();
      cleanName += ` [${normalizedLang}]`;
    }
    
    return cleanName + ext;
  }

  private static async fileExists(filePath: string): Promise<boolean> {
    try {
      await access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  private static async handleDuplicate(
    sourcePath: string,
    targetPath: string,
    strategy: 'skip' | 'rename' | 'overwrite' = 'skip'
  ): Promise<boolean> {
    const fileName = path.basename(sourcePath);
    
    switch (strategy) {
      case 'skip':
        console.log(`⚠️  Skipped (already exists): ${fileName}`);
        return false;

      case 'overwrite':
        try {
          await rename(sourcePath, targetPath);
          console.log(`🔄 Overwritten: ${fileName}`);
          return true;
        } catch (error) {
          console.error(`❌ Unable to overwrite ${fileName}:`, error);
          return false;
        }

      case 'rename':
        try {
          const newPath = await this.findAvailableName(targetPath);
          await rename(sourcePath, newPath);
          console.log(`📝 Renamed: ${fileName} → ${path.basename(newPath)}`);
          return true;
        } catch (error) {
          console.error(`❌ Unable to rename ${fileName}:`, error);
          return false;
        }

      default:
        return false;
    }
  }

  private static async findAvailableName(originalPath: string): Promise<string> {
    const dir = path.dirname(originalPath);
    const ext = path.extname(originalPath);
    const baseName = path.basename(originalPath, ext);
    
    let counter = 1;
    let newPath: string;
    
    do {
      newPath = path.join(dir, `${baseName} (${counter})${ext}`);
      counter++;
    } while (await this.fileExists(newPath));
    
    return newPath;
  }

  static async createDirectoryStructure(basePath: string, structure: string[]): Promise<void> {
    for (const dirPath of structure) {
      const fullPath = path.join(basePath, dirPath);
      try {
        await mkdir(fullPath, { recursive: true });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
          throw error;
        }
      }
    }
  }

  static generatePreviewReport(matches: AnimeMatch[], options: OrganizeOptions): string {
    const minConfidence = options.minConfidence || 70;
    const validMatches = matches.filter(m => m.parsedFile.confidence >= minConfidence);
    const skippedMatches = matches.filter(m => m.parsedFile.confidence < minConfidence);
    
    let report = '📋 ORGANIZATION PREVIEW\n';
    report += '═'.repeat(50) + '\n\n';
    
    report += `📊 Statistics:\n`;
    report += `  • Files analyzed: ${matches.length}\n`;
    report += `  • Will be organized: ${validMatches.length}\n`;
    report += `  • Will be skipped: ${skippedMatches.length}\n`;
    report += `  • Confidence threshold: ${minConfidence}%\n\n`;

    if (validMatches.length > 0) {
      report += `✅ FILES TO BE ORGANIZED:\n`;
      report += '─'.repeat(40) + '\n';
      
      // Grouper par anime
      const grouped = this.groupMatchesByAnime(validMatches);
      
      for (const [animeName, animeMatches] of grouped.entries()) {
        report += `\n📁 ${animeName}/\n`;
        
        const seasons = this.groupMatchesBySeason(animeMatches);
        for (const [seasonKey, seasonMatches] of seasons.entries()) {
          if (seasonKey !== 'undefined') {
            report += `  📁 ${seasonKey}/\n`;
          }
          
          for (const match of seasonMatches.sort((a, b) => (a.parsedFile.episode || 0) - (b.parsedFile.episode || 0))) {
            const confidence = match.parsedFile.confidence;
            const confidenceIcon = confidence >= 90 ? '🟢' : confidence >= 80 ? '🟡' : '🟠';
            const episode = match.parsedFile.episode ? `E${match.parsedFile.episode.toString().padStart(2, '0')}` : '';
            const lang = match.parsedFile.language ? `[${match.parsedFile.language}]` : '';
            
            report += `    ${confidenceIcon} ${episode} ${lang} (${confidence}%) - ${match.parsedFile.fileName}\n`;
          }
        }
      }
    }

    if (skippedMatches.length > 0) {
      report += `\n⚠️  SKIPPED FILES (confidence < ${minConfidence}%):\n`;
      report += '─'.repeat(40) + '\n';
      
      for (const match of skippedMatches) {
        const confidence = match.parsedFile.confidence;
        const reason = match.parsedFile.pattern || 'Pattern non reconnu';
        report += `  🔴 ${match.parsedFile.fileName} (${confidence}% - ${reason})\n`;
      }
    }

    return report;
  }

  private static groupMatchesByAnime(matches: AnimeMatch[]): Map<string, AnimeMatch[]> {
    const grouped = new Map<string, AnimeMatch[]>();
    
    for (const match of matches) {
      const animeName = match.normalizedName;
      if (!grouped.has(animeName)) {
        grouped.set(animeName, []);
      }
      grouped.get(animeName)!.push(match);
    }
    
    return grouped;
  }

  private static groupMatchesBySeason(matches: AnimeMatch[]): Map<string, AnimeMatch[]> {
    const grouped = new Map<string, AnimeMatch[]>();
    
    for (const match of matches) {
      const seasonKey = match.parsedFile.season ? `Season ${match.parsedFile.season}` : 'undefined';
      if (!grouped.has(seasonKey)) {
        grouped.set(seasonKey, []);
      }
      grouped.get(seasonKey)!.push(match);
    }
    
    return grouped;
  }

  static async validatePath(dirPath: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const stats = await stat(dirPath);
      if (!stats.isDirectory()) {
        return { valid: false, error: 'The specified path is not a directory' };
      }
      
      // Vérifier les permissions
      await access(dirPath, fs.constants.R_OK | fs.constants.W_OK);
      return { valid: true };
      
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { valid: false, error: 'Directory does not exist' };
      } else if ((error as NodeJS.ErrnoException).code === 'EACCES') {
        return { valid: false, error: 'Insufficient permissions to access directory' };
      } else {
        return { valid: false, error: `Error: ${error}` };
      }
    }
  }
}