package com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces

import com.inso_world.binocular.infrastructure.sql.persistence.entity.DeveloperEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.RepositoryEntity
import com.inso_world.binocular.model.Repository
import java.util.stream.Stream

internal interface IDeveloperDao : IDao<DeveloperEntity, Long> {
    fun findByIid(iid: com.inso_world.binocular.model.Developer.Id): DeveloperEntity?

    fun findAllByGitSignatureIn(emails: Collection<String>): Stream<DeveloperEntity>

    fun findAll(repository: RepositoryEntity): Iterable<DeveloperEntity>

    fun findAllAsStream(repository: Repository): Stream<DeveloperEntity>
}
