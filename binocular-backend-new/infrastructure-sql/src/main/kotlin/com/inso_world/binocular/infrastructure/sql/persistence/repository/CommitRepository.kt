package com.inso_world.binocular.infrastructure.sql.persistence.repository

import com.inso_world.binocular.infrastructure.sql.persistence.entity.CommitEntity
import com.inso_world.binocular.model.Repository
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.stream.Stream
import kotlin.uuid.Uuid
import org.springframework.stereotype.Repository as SpringRepository

@SpringRepository
internal interface CommitRepository :
    JpaRepository<CommitEntity, Long>,
    JpaSpecificationExecutor<CommitEntity> {
    /**
     * Fetches only the SHAs that actually exist in the database.
     */
    @Suppress("ktlint:standard:function-naming")
    fun findAllByRepository_IdAndShaIn(
        repoId: Long,
        shas: Collection<String>,
    ): Set<CommitEntity>

    @Suppress("ktlint:standard:function-naming")
    fun findAllByRepository_Iid(iid: Repository.Id): Stream<CommitEntity>

    // @EntityGraph("Commit.full")
    @Query("SELECT c FROM CommitEntity c")
    fun findAllAsStream(): Stream<CommitEntity>

    @Query(
        """
            SELECT b.head FROM BranchEntity b WHERE (b.name = :branch) AND (b.repository.iid = :repoIid)
 """,
    )
    fun findLeafCommitsByRepository(
        @Param("repoIid") repoId: Uuid,
        @Param("branch") branch: String,
    ): CommitEntity?

    @Query(
        """
            SELECT b.head FROM BranchEntity b WHERE (b.repository.iid = :repoIid)
 """,
    )
    fun findAllLeafCommits(
        @Param("repoIid") repoIid: Uuid,
    ): Iterable<CommitEntity>

    @Suppress("ktlint:standard:function-naming")
    fun findByRepository_IidAndSha(
        iid: Uuid,
        sha: String,
    ): CommitEntity?

    fun findByIid(iid: Uuid): CommitEntity?

    fun findAllByIidIn(iids: Collection<Uuid>): List<CommitEntity>

    @Query(
        """
            select ch from CommitEntity c 
            join c.children ch 
            where c.sha = :sha
        """
    )
    fun findChildrenBySha(
        @Param("sha") sha: String,
    ): Set<CommitEntity>

    @Query(
        """
                select p from CommitEntity c 
                join c.parents p 
                where c.sha = :sha
            """,
    )
    fun findParentsBySha(
        @Param("sha") sha: String,
    ): Set<CommitEntity>
}
