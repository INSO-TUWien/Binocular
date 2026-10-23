package com.inso_world.binocular.infrastructure.arangodb.persistence.entity

import com.arangodb.springframework.annotation.Document
import com.arangodb.springframework.annotation.Field
import com.arangodb.springframework.annotation.PersistentIndexed
import com.arangodb.springframework.annotation.Ref
import com.arangodb.springframework.annotation.Relations
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.CommitBuildConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.CommitCommitConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.CommitFileConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.CommitModuleConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.CommitUserConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.IssueCommitConnectionEntity
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.Signature
import org.springframework.data.annotation.Id
import java.time.LocalDateTime
import java.util.Date
import kotlin.uuid.Uuid

/**
 * ArangoDB-specific Commit entity.
 *
 * Represents the persistence layer for the [Commit][com.inso_world.binocular.model.Commit] domain object.
 *
 * ### Identity Mapping
 * - [id]: ArangoDB internal document ID (_key)
 * - [iid]: Domain immutable identity (UUID)
 * - [sha]: Business key (unique SHA-1 hash)
 *
 * ### Relationships
 * - [repository]: Owning repository (required)
 * - [author]: The developer who authored the commit
 * - [committer]: The developer who committed the code
 * - [parents]: Parent commits via edge collection
 * - [children]: Child commits via edge collection
 *
 * ### Indexes
 * - [sha]: Unique persistent index for SHA-based lookups
 */
@Document(collection = "commits")
data class CommitEntity(
    @Id var id: String? = null,
    @Field("sha")
    @PersistentIndexed(unique = true)
    var sha: String,
    var iid: Uuid,
    var authorDateTime: LocalDateTime,
    var commitDateTime: LocalDateTime,
    @Deprecated("Use authorDateTime/commitDateTime instead")
    var date: Date? = null,
    var message: String? = null,
    var webUrl: String? = null,
    @Deprecated("do not use")
    var branch: String? = null,
    var stats: StatsEntity? = null,
    @Ref(lazy = false)
    val author: DeveloperEntity,
    @Ref(lazy = false)
    val committer: DeveloperEntity,
    @Ref(lazy = false)
    val repository: RepositoryEntity,
    @Relations(
        edges = [CommitCommitConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.OUTBOUND
    )
    var parents: List<CommitEntity> = emptyList(),
    @Relations(
        edges = [CommitCommitConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND
    )
    var children: List<CommitEntity> = emptyList(),
    @Relations(
        edges = [CommitBuildConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.OUTBOUND
    )
    var builds: List<BuildEntity> = emptyList(),
    @Relations(
        edges = [CommitFileConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.OUTBOUND
    )
    var files: List<FileEntity> = emptyList(),
    @Relations(
        edges = [CommitModuleConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.OUTBOUND
    )
    var modules: List<ModuleEntity> = emptyList(),
    @Relations(
        edges = [CommitUserConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.OUTBOUND
    )
    var users: List<UserEntity> = emptyList(),
    @Relations(
        edges = [IssueCommitConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND
    )
    var issues: List<IssueEntity> = emptyList(),
) {
    /**
     * Converts this CommitEntity to a Commit domain object.
     *
     * @return Commit domain object
     */
    fun toDomain(): Commit {
        val authorSignature = Signature(developerId = author.iid, timestamp = authorDateTime)
        val committerSignature =
            if (committer.iid == author.iid && commitDateTime == authorDateTime) {
                authorSignature
            } else {
                Signature(developerId = committer.iid, timestamp = commitDateTime)
            }
        return Commit(
            sha = this.sha,
            authorSignature = authorSignature,
            committerSignature = committerSignature,
            repositoryId = Repository.Id(this.repository.iid),
            message = this.message,
        ).apply {
            this.id = this@CommitEntity.id
            this.webUrl = this@CommitEntity.webUrl
            this.stats =
                this@CommitEntity.stats?.let {
                    com.inso_world.binocular.model.Stats(
                        additions = it.additions,
                        deletions = it.deletions,
                        kind = it.kind ?: com.inso_world.binocular.model.Stats.StatsKind.MODIFICATION
                    )
                }
        }
    }
}

/**
 * Converts a Commit domain object to CommitEntity.
 *
 * @param repository The RepositoryEntity
 * @param author The author DeveloperEntity
 * @param committer The committer DeveloperEntity
 * @return CommitEntity for persistence
 */
internal fun Commit.toArangoEntity(
    repository: RepositoryEntity,
    author: DeveloperEntity,
    committer: DeveloperEntity,
): CommitEntity =
    CommitEntity(
        iid = this.iid.value,
        sha = this.sha,
        authorDateTime = this.authorSignature.timestamp,
        commitDateTime = this.committerSignature.timestamp,
        message = this.message,
        webUrl = this.webUrl,
        branch = this.branch,
        repository = repository,
        author = author,
        committer = committer,
        stats =
            this.stats?.let {
                StatsEntity(
                    additions = it.additions.toLong(),
                    deletions = it.deletions.toLong(),
                    kind = it.kind
                )
            }
    ).apply {
        this.id = this@toArangoEntity.id?.trim()
    }
