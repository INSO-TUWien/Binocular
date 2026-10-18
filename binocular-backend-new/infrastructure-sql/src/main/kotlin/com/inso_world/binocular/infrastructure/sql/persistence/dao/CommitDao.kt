@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.sql.persistence.dao

import com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.ICommitDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.CommitEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.RepositoryEntity
import com.inso_world.binocular.infrastructure.sql.persistence.repository.CommitRepository
import com.inso_world.binocular.model.Commit
import jakarta.persistence.criteria.JoinType
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Repository
import java.util.stream.Stream
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * SQL implementation of ICommitDao.
 */
@Repository
internal class CommitDao(
    @field:Autowired
    private val repo: CommitRepository,
) : SqlDao<CommitEntity, Long>(),
    ICommitDao {
    init {
        this.clazz = CommitEntity::class.java
        this.repository = repo
    }

    override fun findByIid(iid: Commit.Id): CommitEntity? = findByIid(iid as Any)

    override fun findByIid(iid: Any): CommitEntity? {
        val uIid: Uuid =
            when (iid) {
                is Commit.Id -> iid.value
                is Uuid -> iid
                is String -> Uuid.parse(iid)
                else -> throw IllegalArgumentException("Unsupported iid type: ${iid.javaClass}")
            }
        return this.repo.findByIid(uIid)
    }

    override fun findByIids(iids: Collection<Any>): List<CommitEntity> {
        val uIids =
            iids.map { iid ->
                when (iid) {
                    is Commit.Id -> iid.value
                    is Uuid -> iid
                    is String -> Uuid.parse(iid)
                    else -> throw IllegalArgumentException("Unsupported iid type: ${iid.javaClass}")
                }
            }
        return this.repo.findAllByIidIn(uIids)
    }

    @OptIn(ExperimentalUuidApi::class)
    override fun findAllByIidIn(iids: Collection<Commit.Id>): List<CommitEntity> = repo.findAllByIidIn(iids.map { it.value })

    private object CommitEntitySpecification {
        @OptIn(ExperimentalUuidApi::class)
        fun hasRepositoryIid(iid: com.inso_world.binocular.model.Repository.Id): Specification<CommitEntity> =
            Specification { root, query, cb ->
                if (query?.resultType != Long::class.java) {
                    root.fetch<CommitEntity, Any>("committer", JoinType.LEFT)
                    root.fetch<CommitEntity, Any>("author", JoinType.LEFT)
                }
                cb.equal(root.get<RepositoryEntity>("repository").get<Uuid>("iid"), iid.value)
            }

        fun hasShaIn(shas: Collection<String>): Specification<CommitEntity> =
            Specification { root, _, cb ->
                root.get<String>("sha").`in`(shas)
            }
    }

    override fun findExistingSha(
        repository: com.inso_world.binocular.model.Repository,
        shas: Collection<String>,
    ): Iterable<CommitEntity> {
        val rid = repository.iid
        val shas =
            this.repo.findAll(
                Specification.allOf(
                    CommitEntitySpecification
                        .hasRepositoryIid(rid)
                        .and(CommitEntitySpecification.hasShaIn(shas)),
                ),
            )
        return shas
    }

    @OptIn(ExperimentalUuidApi::class)
    override fun findHeadForBranch(
        repository: RepositoryEntity,
        branch: String,
    ): CommitEntity? = this.repo.findLeafCommitsByRepository(repository.iid.value, branch)

    @OptIn(ExperimentalUuidApi::class)
    override fun findAllLeafCommits(repository: RepositoryEntity): Iterable<CommitEntity> =
        this.repo.findAllLeafCommits(repository.iid.value)

    @OptIn(ExperimentalUuidApi::class)
    override fun findBySha(
        repository: RepositoryEntity,
        sha: String,
    ): CommitEntity? = this.repo.findByRepository_IidAndSha(repository.iid.value, sha)

    override fun findAll(repository: com.inso_world.binocular.model.Repository): Stream<CommitEntity> =
        this.repo.findAllByRepository_Iid(repository.iid)

    override fun findAllAsStream(): Stream<CommitEntity> = repo.findAllAsStream()

    override fun findParentsBySha(sha: String): Set<CommitEntity> = this.repo.findParentsBySha(sha)

    override fun findChildrenBySha(sha: String): Set<CommitEntity> = this.repo.findChildrenBySha(sha)
}
