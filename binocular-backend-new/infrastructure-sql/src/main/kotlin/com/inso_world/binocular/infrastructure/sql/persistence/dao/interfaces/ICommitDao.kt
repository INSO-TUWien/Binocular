package com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces

import com.inso_world.binocular.infrastructure.sql.persistence.entity.CommitEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.RepositoryEntity
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Repository
import java.util.stream.Stream

internal interface ICommitDao : IDao<CommitEntity, Long> {
    fun findByIid(iid: com.inso_world.binocular.model.Commit.Id): CommitEntity?

    fun findAllByIidIn(iids: Collection<com.inso_world.binocular.model.Commit.Id>): List<CommitEntity>

    fun findExistingSha(
        repository: Repository,
        shas: Collection<String>,
    ): Iterable<CommitEntity>

    // TODO branch should be required!
    fun findHeadForBranch(
        repository: RepositoryEntity,
        branch: String,
    ): CommitEntity?

    fun findAllLeafCommits(repository: RepositoryEntity): Iterable<CommitEntity>

    fun findBySha(
//        TODO change to repository: Repository, after refactoring @Commit
        repository: RepositoryEntity,
        sha: String,
    ): CommitEntity?

    fun findAll(repository: Repository): Stream<CommitEntity>

    fun findParentsBySha(sha: String): Set<CommitEntity>

    fun findChildrenBySha(sha: String): Set<CommitEntity>
}
