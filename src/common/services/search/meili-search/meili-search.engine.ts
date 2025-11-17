import { meiliSearchClient } from "#common/services/search/meili-search/meili-search.client.js";
import { logger } from "#common/utils/logger.js";

/**
 * Generic interface for MeiliSearch service operations.
 * Can be implemented for different entity types (products, categories, etc.).
 *
 * @template T - The document type to be indexed (e.g., MeiliProduct, MeiliCategory)
 */
export interface IMeiliService<T> {
  /**
   * Clears all documents from the search index.
   * Use with caution - typically only for maintenance or testing.
   *
   * @returns Promise resolving to the deletion task info
   */
  clearIndex(): Promise<any>;

  /**
   * Deletes a document from the search index.
   * Called after entity deletion from the database.
   *
   * @param documentId - ID of the document to delete from index
   * @returns Promise resolving to the deletion task info
   */
  deleteDocument(documentId: string): Promise<any>;

  /**
   * Ensures the MeiliSearch index exists and is properly configured.
   * Creates the index if it doesn't exist and sets up searchable/filterable attributes.
   */
  ensureIndex(): Promise<void>;

  /**
   * Indexes or updates a single document.
   * Called after entity creation or update in the database.
   *
   * @param document - Document to index
   * @returns Promise resolving to the indexing task info
   */
  indexDocument(document: T): Promise<any>;

  /**
   * Indexes multiple documents in bulk.
   * Used for initial indexing or bulk re-indexing operations.
   *
   * @param documents - Array of documents to index
   * @returns Promise resolving to the indexing task info
   */
  indexDocuments(documents: T[]): Promise<any>;

  /**
   * Searches documents using MeiliSearch full-text search.
   * Supports pagination, sorting, and filtering.
   *
   * @param q - Search query string
   * @param page - Zero-based page number (default: 0)
   * @param pageSize - Number of results per page (default: 20)
   * @param sortBy - Field to sort by (optional)
   * @param sortOrder - Sort order: "asc" or "desc" (default: "desc")
   * @returns Promise resolving to search results with pagination metadata
   */
  searchDocuments(
    q: string,
    page?: number,
    pageSize?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ): Promise<{
    items: any[];
    page: number;
    pageSize: number;
    total: number;
    totalPage: number;
  }>;
}

/**
 * Base abstract class for MeiliSearch service implementations.
 * Provides common functionality that can be extended for specific entity types.
 *
 * @template T - The document type to be indexed (must be a record/object type)
 */
export abstract class BaseMeiliService<T extends Record<string, any>>
  implements IMeiliService<T>
{
  protected index: ReturnType<typeof meiliSearchClient.index>;
  protected indexName: string;

  constructor(indexName: string) {
    this.indexName = indexName;
    this.index = meiliSearchClient.index(indexName);
  }

  /**
   * Clears all documents from the search index.
   * Use with caution - typically only for maintenance or testing.
   *
   * @returns Promise resolving to the deletion task info
   */
  async clearIndex(): Promise<any> {
    await this.ensureIndex();
    logger.warn(
      `Clearing all documents from MeiliSearch index: ${this.indexName}`,
    );
    return this.index.deleteAllDocuments();
  }

  /**
   * Deletes a document from the search index.
   * Called after entity deletion from the database.
   *
   * @param documentId - ID of the document to delete from index
   * @returns Promise resolving to the deletion task info
   */
  async deleteDocument(documentId: string): Promise<any> {
    await this.ensureIndex();
    return this.index.deleteDocument(documentId);
  }

  /**
   * Ensures the MeiliSearch index exists and is properly configured.
   * Creates the index if it doesn't exist and sets up searchable/filterable attributes.
   */
  async ensureIndex(): Promise<void> {
    try {
      await meiliSearchClient.getIndex(this.indexName);
    } catch {
      // Index doesn't exist, create it
      await meiliSearchClient.createIndex(this.indexName, { primaryKey: "id" });
      logger.info(`Created MeiliSearch index: ${this.indexName}`);
    }

    // Configure searchable attributes (fields to search in)
    await this.index.updateSearchableAttributes(this.getSearchableAttributes());

    // Configure filterable attributes (fields to filter by)
    await this.index.updateFilterableAttributes(this.getFilterableAttributes());

    // Configure sortable attributes
    await this.index.updateSortableAttributes(this.getSortableAttributes());
  }

  /**
   * Indexes or updates a single document.
   * Called after entity creation or update in the database.
   *
   * @param document - Document to index
   * @returns Promise resolving to the indexing task info
   */
  async indexDocument(document: T): Promise<any> {
    await this.ensureIndex();
    return this.index.addDocuments([document]);
  }

  /**
   * Indexes multiple documents in bulk.
   * Used for initial indexing or bulk re-indexing operations.
   *
   * @param documents - Array of documents to index
   * @returns Promise resolving to the indexing task info
   */
  async indexDocuments(documents: T[]): Promise<any> {
    await this.ensureIndex();
    logger.info(
      `Indexing ${documents.length} documents to MeiliSearch index: ${this.indexName}`,
    );
    return this.index.addDocuments(documents);
  }

  /**
   * Searches documents using MeiliSearch full-text search.
   * Supports pagination, sorting, and filtering.
   *
   * @param q - Search query string
   * @param page - Zero-based page number (default: 0)
   * @param pageSize - Number of results per page (default: 20)
   * @param sortBy - Field to sort by (optional)
   * @param sortOrder - Sort order: "asc" or "desc" (default: "desc")
   * @returns Promise resolving to search results with pagination metadata
   */
  async searchDocuments(
    q: string,
    page = 0,
    pageSize = 20,
    sortBy?: string,
    sortOrder: "asc" | "desc" = "desc",
    options?: { filters?: string }
  ) {
    await this.ensureIndex();
    const offset = page * pageSize;
    const limit = pageSize;

    const searchParams: Record<string, unknown> = {
      limit,
      offset,
    };

    if (sortBy) {
      // MeiliSearch expects "field:order" format
      searchParams.sort = [`${sortBy}:${sortOrder}`];
    }
    if (options?.filters) {
      searchParams.filter = options.filters;
    }
    const result = await this.index.search(q, searchParams);

    const total = result.estimatedTotalHits ?? 0;
    const totalPage = total > 0 ? Math.ceil(total / pageSize) : 1;

    return {
      items: result.hits,
      page,
      pageSize,
      total,
      totalPage,
    };
  }

  /**
   * Abstract method to get filterable attributes for the entity.
   * Must be implemented by subclasses.
   */
  protected abstract getFilterableAttributes(): string[];

  /**
   * Abstract method to get searchable attributes for the entity.
   * Must be implemented by subclasses.
   */
  protected abstract getSearchableAttributes(): string[];

  /**
   * Abstract method to get sortable attributes for the entity.
   * Must be implemented by subclasses.
   */
  protected abstract getSortableAttributes(): string[];
}
