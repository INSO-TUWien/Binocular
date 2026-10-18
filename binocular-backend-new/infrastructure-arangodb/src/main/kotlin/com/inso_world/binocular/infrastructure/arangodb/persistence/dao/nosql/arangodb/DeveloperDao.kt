package com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb

import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.IDeveloperDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.DeveloperEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.DeveloperMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.DeveloperRepository
import com.inso_world.binocular.model.Developer
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Repository

/**
 * ArangoDB implementation of IDeveloperDao.
 */
@Repository
internal class DeveloperDao
    @Autowired
    constructor(
        private val developerRepository: DeveloperRepository,
        private val developerMapper: DeveloperMapper,
    ) : MappedArangoDbDao<Developer, DeveloperEntity, String>(developerRepository, developerMapper),
        IDeveloperDao
