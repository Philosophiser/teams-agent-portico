import * as path from "path";
import * as fs from "fs";

/**
 * Interface for search results containing both content and metadata
 */
export interface SearchResult {
    content: string;
    citation: string;
    score: number;
}

/**
 * Interface for rendered context data
 */
export interface RenderedContext {
    content: string;
    sources: string[];
}

/**
 * Interface for document chunks
 */
export interface DocumentChunk {
    content: string;
    citation: string;
    chunkIndex: number;
    totalChunks: number;
}

/**
 * Configuration for retrieval parameters
 */
export interface RetrievalConfig {
    maxChunkSize: number;      // Maximum tokens per chunk (approximate)
    topK: number;              // Number of results to return
    minScore: number;          // Minimum relevance score threshold
}

// Common stop words to filter out during search
const STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'were', 'will', 'with', 'what', 'how', 'why', 'when',
    'where', 'who', 'which', 'can', 'do', 'does', 'did', 'have', 'had',
    'me', 'my', 'about', 'tell', 'explain', 'describe', 'i', 'you', 'your'
]);

export class MyDataSource {
    /**
     * Name of the data source.
     */
    public readonly name: string;

    /**
     * Local data loaded from files.
     */
    private _data: { content: string; citation: string; }[] = [];

    /**
     * Chunked documents for better retrieval
     */
    private _chunks: DocumentChunk[] = [];

    /**
     * Retrieval configuration
     */
    private _config: RetrievalConfig;

    /**
     * Creates a new instance of the MyDataSource.
     * @param name The name identifier for this data source
     * @param config Optional retrieval configuration
     */
    public constructor(name: string, config?: Partial<RetrievalConfig>) {
        this.name = name;
        this._config = {
            maxChunkSize: 800,   // ~800 tokens per chunk
            topK: 3,             // Return top 3 results
            minScore: 0.1,       // Minimum relevance score
            ...config
        };
    }

    /**
     * Initializes the data source by loading files from the data directory.
     */
    public init(): void {
        const filePath = path.join(__dirname, "../data");

        if (!fs.existsSync(filePath)) {
            console.warn(`Data directory not found: ${filePath}`);
            return;
        }

        const files = fs.readdirSync(filePath);

        this._data = files.map(file => {
            try {
                const content = fs.readFileSync(path.join(filePath, file), "utf-8");
                return {
                    content: content.trim(),
                    citation: file
                };
            } catch (error) {
                console.error(`Error reading file ${file}:`, error);
                return {
                    content: "",
                    citation: file
                };
            }
        }).filter(item => item.content.length > 0);

        // Create chunks from loaded documents
        this._chunks = this.chunkDocuments(this._data);

        console.log(`Loaded ${this._data.length} documents (${this._chunks.length} chunks) from ${filePath}`);
    }

    /**
     * Splits documents into smaller chunks for better retrieval
     */
    private chunkDocuments(documents: { content: string; citation: string; }[]): DocumentChunk[] {
        const chunks: DocumentChunk[] = [];

        for (const doc of documents) {
            const docChunks = this.splitIntoChunks(doc.content, this._config.maxChunkSize);
            docChunks.forEach((chunk, index) => {
                chunks.push({
                    content: chunk,
                    citation: doc.citation,
                    chunkIndex: index,
                    totalChunks: docChunks.length
                });
            });
        }

        return chunks;
    }

    /**
     * Splits text into chunks by paragraphs, respecting approximate token limits
     */
    private splitIntoChunks(text: string, maxSize: number): string[] {
        const paragraphs = text.split(/\n\n+/);
        const chunks: string[] = [];
        let currentChunk = "";

        for (const paragraph of paragraphs) {
            const trimmedPara = paragraph.trim();
            if (!trimmedPara) continue;

            // Approximate token count (rough: 1 token ≈ 4 chars)
            const currentTokens = Math.ceil(currentChunk.length / 4);
            const paraTokens = Math.ceil(trimmedPara.length / 4);

            if (currentTokens + paraTokens > maxSize && currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = trimmedPara;
            } else {
                currentChunk += (currentChunk ? "\n\n" : "") + trimmedPara;
            }
        }

        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks.length > 0 ? chunks : [text];
    }

    /**
     * Extracts meaningful keywords from a query
     */
    private extractKeywords(query: string): string[] {
        return query
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !STOP_WORDS.has(word));
    }

    /**
     * Calculates relevance score for a document against query keywords
     */
    private calculateScore(content: string, keywords: string[]): number {
        if (keywords.length === 0) return 0;

        const contentLower = content.toLowerCase();
        let score = 0;
        let matchedKeywords = 0;

        for (const keyword of keywords) {
            // Count occurrences of keyword
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            const matches = contentLower.match(regex);

            if (matches) {
                matchedKeywords++;
                // Weight by frequency (with diminishing returns)
                score += Math.log(1 + matches.length);
            }
        }

        // Normalize by keyword count and boost for matching multiple keywords
        const coverageBonus = matchedKeywords / keywords.length;
        return (score * coverageBonus) / Math.sqrt(keywords.length);
    }

    /**
     * Searches for relevant content based on a query string.
     * Uses keyword extraction and relevance scoring.
     * @param query The search query
     * @returns Array of search results sorted by relevance
     */
    public search(query: string): SearchResult[] {
        if (!query) {
            return [];
        }

        const keywords = this.extractKeywords(query);

        if (keywords.length === 0) {
            // Fallback: return first document if no meaningful keywords
            if (this._data.length > 0) {
                return [{
                    content: this._data[0].content,
                    citation: this._data[0].citation,
                    score: 0.5
                }];
            }
            return [];
        }

        // Score all chunks
        const scoredChunks = this._chunks.map(chunk => ({
            ...chunk,
            score: this.calculateScore(chunk.content, keywords)
        }));

        // Filter by minimum score and sort by relevance
        const relevantChunks = scoredChunks
            .filter(chunk => chunk.score >= this._config.minScore)
            .sort((a, b) => b.score - a.score)
            .slice(0, this._config.topK);

        // Convert to SearchResult format
        return relevantChunks.map(chunk => ({
            content: chunk.content,
            citation: chunk.citation,
            score: chunk.score
        }));
    }
    /**
     * Renders search results into a formatted context string for use in prompts.
     * @param query The original search query
     * @returns Rendered context with metadata
     */
    public renderContext(query: string): RenderedContext {
        const searchResults = this.search(query);
        
        if (searchResults.length === 0) {
            return {
                content: "",
                sources: []
            };
        }

        let contextContent = "";
        const sources: string[] = [];

        for (const result of searchResults) {
            const formattedDoc = this.formatDocument(result.content, result.citation);
            contextContent += formattedDoc + "\n\n";
            sources.push(result.citation);
        }

        return {
            content: contextContent.trim(),
            sources
        };
    }

    /**
     * Get all available documents for browsing or debugging.
     * @returns Array of all loaded documents
     */
    public getAllDocuments(): { content: string; citation: string; }[] {
        return [...this._data];
    }

    /**
     * Formats a document with its citation for inclusion in context.
     * @param content The document content
     * @param citation The source citation
     * @returns Formatted document string
     */
    private formatDocument(content: string, citation: string): string {
        return `<context source="${citation}">\n${content}\n</context>`;
    }
}