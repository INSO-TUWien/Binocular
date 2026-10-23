package com.inso_world.binocular.infrastructure.arangodb.persistence.entity

import com.arangodb.springframework.annotation.Document
import com.arangodb.springframework.annotation.Field
import com.arangodb.springframework.annotation.PersistentIndexed
import com.arangodb.springframework.annotation.Ref
import com.arangodb.springframework.annotation.Relations
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.CommitFileUserConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.CommitUserConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.IssueUserConnectionEntity
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.User
import org.springframework.data.annotation.Id
import kotlin.uuid.Uuid

/**
 * ArangoDB-specific User entity.
 *
 * Represents the persistence layer for the [User][com.inso_world.binocular.model.User] domain object.
 *
 * ### Identity Mapping
 * - [id]: ArangoDB internal document ID (_key)
 * - [iid]: Domain immutable identity (UUID)
 * - [gitSignature]: Combined "Name <email>" format
 *
 * ### Relationships
 * - [repository]: Owning repository (required)
 *
 * ### Indexes
 * - [iid]: Unique persistent index for UUID-based lookups
 */
@Document("users")
data class UserEntity(
    @Id
    var id: String? = null,
    @Field("iid")
    @PersistentIndexed(unique = true)
    var iid: Uuid,
    var gitSignature: String,
    @Ref(lazy = true)
    var repository: RepositoryEntity? = null,
    @Relations(
        edges = [CommitUserConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND,
    )
    var commits: List<CommitEntity> = emptyList(),
    @Relations(
        edges = [IssueUserConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND,
    )
    var issues: Set<IssueEntity> = emptySet(),
    @Relations(
        edges = [CommitFileUserConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND,
    )
    var files: Set<FileEntity> = emptySet(),
) {
    /**
     * Extracts the name portion from the git signature.
     * Format expected: "Name <email@example.com>"
     */
    val name: String
        get() {
            val nameRegex = Regex("""^(.+?)\s*<""")
            return nameRegex
                .find(gitSignature)
                ?.groupValues
                ?.get(1)
                ?.trim()
                ?: throw IllegalArgumentException("Could not extract name from gitSignature: $gitSignature")
        }

    /**
     * Extracts the email portion from the git signature.
     * Format expected: "Name <email@example.com>"
     */
    val email: String
        get() {
            val emailRegex = Regex("""<([^>]+)>$""")
            return emailRegex.find(gitSignature)?.groupValues?.get(1)
                ?: throw IllegalArgumentException("Could not extract email from gitSignature: $gitSignature")
        }

    /**
     * Converts this UserEntity to a User domain object.
     *
     * @param repository The repository domain object to associate with the user
     * @return User domain object
     */
    @Suppress("DEPRECATION")
    fun toDomain(): User =
        User(
            name = this.name,
            repositoryId = repository?.let { Repository.Id(it.iid) } ?: Repository.Id(this.iid),
        ).apply {
            this.email = this@UserEntity.email
            this.id = this@UserEntity.id
        }
}

/**
 * Converts a User domain object to UserEntity.
 *
 * @param repository The RepositoryEntity to associate with the user
 * @return UserEntity for persistence
 */
@Suppress("DEPRECATION")
internal fun User.toArangoEntity(repository: RepositoryEntity): UserEntity =
    UserEntity(
        id = this.id,
        iid = this.iid.value,
        gitSignature = this.gitSignature,
        repository = repository,
    )
