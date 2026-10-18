package com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.infrastructure.arangodb.model.edge.CommitFileConnection
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.File
import com.inso_world.binocular.model.FileOwnership
import com.inso_world.binocular.model.Stats
import org.springframework.data.domain.Pageable

/**
 * Interface for CommitFileConnection DAO operations.
 * This interface is implemented by both ArangoDB and SQL DAOs.
 */
internal interface ICommitFileConnectionDao {
    /**
     * Find all files connected to a commit
     */
    fun findFilesByCommit(commitId: String): List<File>

    /**
     * Find files connected to a commit paginated.
     */
    fun findFilesByCommitPaged(
        commitId: String,
        pageable: Pageable
    ): Page<File>

    /**
     * Find all commits connected to a file
     */
    fun findCommitsByFile(fileId: String): List<Commit>

    /**
     * Find commits connected to a file paginated.
     */
    fun findCommitsByFilePaged(
        fileId: String,
        pageable: Pageable
    ): Page<Commit>

    /**
     * Return stats (additions/deletions) for a given commit
     */
    fun findCommitStatsByCommit(commitId: String): Stats

    /**
     * Return stats per file for a given commit, keyed by file id
     */
    fun findFileStatsByCommit(commitId: String): Map<String, Stats>

    /**
     * Return ownership entries (user + hunks) for a given commit and file
     */
    fun findFileOwnershipByCommitAndFile(
        commitId: String,
        fileId: String
    ): List<FileOwnership>

    /**
     * Return action per file for a given commit, keyed by file id
     */
    fun findFileActionsByCommit(commitId: String): Map<String, String?>

    /**
     * Save a commit-file connection
     */
    fun save(connection: CommitFileConnection): CommitFileConnection

    /**
     * Delete all commit-file connections
     */
    fun deleteAll()
}
