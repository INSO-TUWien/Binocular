package com.inso_world.binocular.infrastructure.arangodb.persistence.repository.edges

import com.arangodb.springframework.annotation.Query
import com.arangodb.springframework.repository.ArangoRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.CommitEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.FileEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.CommitFileConnectionEntity
import org.springframework.stereotype.Repository

@Repository
interface CommitFileConnectionRepository : ArangoRepository<CommitFileConnectionEntity, String> {
    @Query(
        """
    FOR c IN `commits-files`
        FILTER c._from == CONCAT('commits/', @commitId)
        FOR f IN files
            FILTER f._id == c._to
            RETURN f
""",
    )
    fun findFilesByCommit(commitId: String): List<FileEntity>

    @Query(
        """
    FOR c IN `commits-files`
        FILTER c._from == CONCAT('commits/', @commitId)
        FOR f IN files
            FILTER f._id == c._to
            LIMIT @offset, @limit
            RETURN f
""",
    )
    fun findFilesByCommitOrdered(
        commitId: String,
        offset: Int,
        limit: Int
    ): List<FileEntity>

    @Query(
        """
FOR c IN commits
  FILTER c._key == @commitId
  RETURN {
    additions: TO_NUMBER(c.stats.additions OR 0),
    deletions: TO_NUMBER(c.stats.deletions OR 0)
  }
"""
    )
    fun findCommitStats(commitId: String): List<Map<String, Any>>

    @Query(
        """
    FOR c IN `commits-files`
        FILTER c._from == CONCAT('commits/', @commitId)
        RETURN {
          fileId: PARSE_IDENTIFIER(c._to).key,
          additions: TO_NUMBER(c.stats.additions OR 0),
          deletions: TO_NUMBER(c.stats.deletions OR 0)
        }
""",
    )
    fun findFileStatsByCommit(commitId: String): List<Map<String, Any>>

    @Query(
        """
    FOR c IN `commits-files`
        FILTER c._from == CONCAT('commits/', @commitId)
        RETURN {
          fileId: PARSE_IDENTIFIER(c._to).key,
          action: c.action
        }
""",
    )
    fun findFileActionsByCommit(commitId: String): List<Map<String, Any?>>

    @Query(
        """
    FOR c IN `commits-files`
        FILTER c._from == CONCAT('commits/', @commitId)
        COLLECT WITH COUNT INTO length
        RETURN length
""",
    )
    fun countFilesByCommit(commitId: String): List<Long>

    @Query(
        """
    FOR cf IN `commits-files`
        FILTER cf._from == CONCAT('commits/', @commitId) AND cf._to == CONCAT('files/', @fileId)
        FOR cfu IN `commit-files-users`
            FILTER cfu._from == cf._id
            RETURN {
              userId: PARSE_IDENTIFIER(cfu._to).key,
              hunks: cfu.hunks
            }
""",
    )
    fun findOwnershipByCommitAndFile(
        commitId: String,
        fileId: String
    ): List<Map<String, Any?>>

    @Query(
        """
    FOR c IN `commits-files`
        FILTER c._to == CONCAT('files/', @fileId)
        FOR cm IN commits
            FILTER cm._id == c._from
            RETURN cm
""",
    )
    fun findCommitsByFile(fileId: String): List<CommitEntity>

    @Query(
        """
    FOR c IN `commits-files`
        FILTER c._to == CONCAT('files/', @fileId)
        FOR cm IN commits
            FILTER cm._id == c._from
            SORT (cm.date == null) ASC, cm.date ASC, cm.sha ASC
            LIMIT @offset, @limit
            RETURN cm
""",
    )
    fun findCommitsByFileOrdered(
        fileId: String,
        offset: Int,
        limit: Int
    ): List<CommitEntity>

    @Query(
        """
    FOR c IN `commits-files`
        FILTER c._to == CONCAT('files/', @fileId)
        COLLECT WITH COUNT INTO length
        RETURN length
""",
    )
    fun countCommitsByFile(fileId: String): List<Long>
}
