@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)
package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.core.persistence.proxy.RelationshipProxyFactory
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.ModuleEntity
import com.inso_world.binocular.model.Module
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component

/**
 * Mapper for Module domain objects.
 *
 * Converts between Module domain objects and ModuleEntity persistence entities for ArangoDB.
 * This mapper handles hierarchical module structures with lazy loading for related commits,
 * files, and parent/child module relationships.
 *
 * ## Design Principles
 * - **Single Responsibility**: Only converts Module structure
 * - **Lazy Loading**: Uses RelationshipProxyFactory for lazy-loaded relationships (commits, files, modules)
 * - **Hierarchical Support**: Handles parent-child module relationships with lazy loading
 *
 * ## Usage
 * This mapper is typically called by infrastructure ports and assemblers. It supports
 * lazy loading of all relationships to optimize performance when traversing module hierarchies.
 */
@Component
internal class ModuleMapper
    @Autowired
    constructor(
        private val proxyFactory: RelationshipProxyFactory,
        @Lazy private val fileMapper: FileMapper,
    ) : EntityMapper<Module, ModuleEntity> {

        @Lazy
        @Autowired
        private lateinit var commitMapper: CommitMapper

        companion object {
            private val logger by logger()
        }

        /**
         * Converts a Module domain object to ModuleEntity.
         *
         * Maps only the basic module properties (ID and path). Relationships to commits,
         * files, and other modules are not persisted in the entity - they are only restored
         * during toDomain through lazy loading.
         *
         * @param domain The Module domain object to convert
         * @return The ModuleEntity (structure only, without relationships)
         */
        override fun toEntity(domain: Module): ModuleEntity =
            ModuleEntity(
                id = domain.id,
                iid = domain.iid.value,
                path = domain.path,
            )

        /**
         * Converts a ModuleEntity to Module domain object.
         *
         * Creates a Module with lazy-loaded relationships to commits, files, child modules,
         * and parent modules. All relationships are loaded on-demand to optimize performance
         * when traversing module hierarchies.
         *
         * @param entity The ModuleEntity to convert
         * @return The Module domain object with lazy-loaded relationships
         */
        override fun toDomain(entity: ModuleEntity): Module {
            // Fast-path: Check if already mapped

            return Module(
                id = entity.id,
                path = entity.path,
                iid = Module.Id(entity.iid),
                commitIds = (entity.commits ?: emptyList()).map { com.inso_world.binocular.model.Commit.Id(it.iid) },
                fileIds = (entity.files ?: emptyList()).map { com.inso_world.binocular.model.File.Id(it.iid) },
                childModuleIds = (entity.childModules ?: emptyList()).map { Module.Id(it.iid) },
                parentModuleIds = (entity.parentModules ?: emptyList()).map { Module.Id(it.iid) },
                commits =
                    proxyFactory.createLazyList {
                        (entity.commits ?: emptyList()).map { commitEntity ->
                            commitMapper.toDomain(commitEntity)
                        }
                    },
                files =
                    proxyFactory.createLazyList {
                        (entity.files ?: emptyList()).map { fileEntity ->
                            fileMapper.toDomain(fileEntity)
                        }
                    },
                childModules =
                    proxyFactory.createLazyList {
                        (entity.childModules ?: emptyList()).map { childModuleEntity ->
                            toDomain(childModuleEntity)
                        }
                    },
                parentModules =
                    proxyFactory.createLazyList {
                        (entity.parentModules ?: emptyList()).map { parentModuleEntity ->
                            toDomain(parentModuleEntity)
                        }
                    },
            )
        }

        override fun toDomainList(entities: Iterable<ModuleEntity>): List<Module> = entities.map { toDomain(it) }
    }
