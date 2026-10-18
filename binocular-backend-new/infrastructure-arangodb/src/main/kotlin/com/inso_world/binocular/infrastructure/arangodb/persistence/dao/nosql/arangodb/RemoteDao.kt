package com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb

import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.IRemoteDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.RemoteEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.RemoteMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.RemoteRepository
import com.inso_world.binocular.model.vcs.Remote
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Repository

/**
 * ArangoDB implementation of IRemoteDao.
 */
@Repository
internal class RemoteDao
    @Autowired
    constructor(
        private val remoteRepository: RemoteRepository,
        private val remoteMapper: RemoteMapper,
    ) : MappedArangoDbDao<Remote, RemoteEntity, String>(remoteRepository, remoteMapper),
        IRemoteDao
