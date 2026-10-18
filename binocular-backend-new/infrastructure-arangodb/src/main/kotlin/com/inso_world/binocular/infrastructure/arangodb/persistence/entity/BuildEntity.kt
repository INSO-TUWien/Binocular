package com.inso_world.binocular.infrastructure.arangodb.persistence.entity

import com.arangodb.springframework.annotation.Document
import com.arangodb.springframework.annotation.Field
import com.arangodb.springframework.annotation.PersistentIndexed
import com.arangodb.springframework.annotation.Relations
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.CommitBuildConnectionEntity
import org.springframework.data.annotation.Id
import java.util.*
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * ArangoDB-specific Build entity.
 */
@Document("builds")
@OptIn(ExperimentalUuidApi::class)
data class BuildEntity(
    @Id
    var id: String? = null,
    @Field("iid")
    @PersistentIndexed(unique = true)
    var iid: Uuid = Uuid.random(),
    var sha: String? = null,
    var ref: String? = null,
    var status: String? = null,
    var tag: String? = null,
    var user: String? = null,
    var userFullName: String? = null,
    var createdAt: Date? = null,
    var updatedAt: Date? = null,
    var startedAt: Date? = null,
    var finishedAt: Date? = null,
    var committedAt: Date? = null,
    var duration: Int? = null,
    var jobs: List<JobEntity> = emptyList(),
    var webUrl: String? = null,
    @Relations(
        edges = [CommitBuildConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.OUTBOUND,
    )
    var commits: List<CommitEntity> = emptyList(),
)
