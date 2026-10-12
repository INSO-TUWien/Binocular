package com.inso_world.binocular.infrastructure.arangodb.persistence.entity

import com.arangodb.springframework.annotation.Document
import com.arangodb.springframework.annotation.Field
import com.arangodb.springframework.annotation.PersistentIndexed
import com.arangodb.springframework.annotation.Relations
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.BranchFileConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.BranchFileFileConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.CommitFileConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.CommitFileUserConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.ModuleFileConnectionEntity
import org.springframework.data.annotation.Id
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * ArangoDB-specific File entity.
 */
@Document("files")
@OptIn(ExperimentalUuidApi::class)
data class FileEntity(
    @Id
    var id: String? = null,
    @Field("iid")
    @PersistentIndexed(unique = true)
    var iid: Uuid = Uuid.random(),
    var path: String,
    var webUrl: String,
    var maxLength: Long? = null,
    @Relations(
        edges = [CommitFileConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND,
    )
    var commits: List<CommitEntity> = emptyList(),
    @Relations(
        edges = [BranchFileConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND,
    )
    var branches: List<BranchEntity> = emptyList(),
    @Relations(
        edges = [ModuleFileConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND,
    )
    var modules: List<ModuleEntity> = emptyList(),
    @Relations(
        edges = [BranchFileFileConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.OUTBOUND,
    )
    var relatedFiles: List<FileEntity> = emptyList(),
    @Relations(
        edges = [CommitFileUserConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.OUTBOUND,
    )
    var users: List<UserEntity> = emptyList(),
)
