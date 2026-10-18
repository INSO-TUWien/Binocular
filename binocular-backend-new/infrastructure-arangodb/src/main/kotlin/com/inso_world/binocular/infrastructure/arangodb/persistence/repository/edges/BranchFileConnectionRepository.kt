package com.inso_world.binocular.infrastructure.arangodb.persistence.repository.edges

import com.arangodb.springframework.annotation.Query
import com.arangodb.springframework.repository.ArangoRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.BranchEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.FileEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.BranchFileConnectionEntity
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface BranchFileConnectionRepository : ArangoRepository<BranchFileConnectionEntity, String> {
    @Query(
        """
    FOR c IN `branches-files`
        FILTER c._from == CONCAT('branches/', @branchId)
        FOR f IN files
            FILTER f._id == c._to
            RETURN f
""",
    )
    fun findFilesByBranch(
        @Param("branchId") branchId: String
    ): List<FileEntity>

    @Query(
        """
    FOR c IN `branches-files`
        FILTER c._to == CONCAT('files/', @fileId)
        FOR b IN branches
            FILTER b._id == c._from
            RETURN b
""",
    )
    fun findBranchesByFile(
        @Param("fileId") fileId: String
    ): List<BranchEntity>

    @Query(
        """
    FOR c IN `branches-files`
        FILTER c._from == CONCAT('branches/', @branchId)
        FOR f IN files
            FILTER f._id == c._to
            SORT f.path ASC, TO_NUMBER(f._key) ASC, f._key ASC
            LIMIT @offset, @size
            RETURN f
""",
    )
    fun findFilesByBranchAsc(
        @Param("branchId") branchId: String,
        @Param("offset") offset: Int,
        @Param("size") size: Int,
    ): List<FileEntity>

    @Query(
        """
    FOR c IN `branches-files`
        FILTER c._from == CONCAT('branches/', @branchId)
        FOR f IN files
            FILTER f._id == c._to
            SORT f.path DESC, TO_NUMBER(f._key) DESC, f._key DESC
            LIMIT @offset, @size
            RETURN f
""",
    )
    fun findFilesByBranchDesc(
        @Param("branchId") branchId: String,
        @Param("offset") offset: Int,
        @Param("size") size: Int,
    ): List<FileEntity>

    @Query(
        """
        RETURN LENGTH(
          FOR c IN `branches-files`
            FILTER c._from == CONCAT('branches/', @branchId)
            RETURN 1
        )
        """
    )
    fun countFilesByBranch(
        @Param("branchId") branchId: String
    ): Long
}
