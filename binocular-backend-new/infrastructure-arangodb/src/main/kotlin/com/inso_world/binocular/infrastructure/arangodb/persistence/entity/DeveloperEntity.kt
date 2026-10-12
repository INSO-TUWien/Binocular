@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)
package com.inso_world.binocular.infrastructure.arangodb.persistence.entity

import com.arangodb.springframework.annotation.Document
import com.arangodb.springframework.annotation.Ref
import com.arangodb.springframework.annotation.Relations
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.CommitFileUserConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.CommitUserConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.IssueUserConnectionEntity
import com.inso_world.binocular.model.Developer
import com.inso_world.binocular.model.Repository
import org.springframework.data.annotation.Id

/**
 * ArangoDB-specific Developer entity.
 *
 * This entity maps the domain [Developer] model to ArangoDB storage.
 * Unlike the SQL implementation which uses separate name/email columns,
 * this stores the combined git signature for consistency with the existing
 * UserEntity pattern.
 *
 * @property id ArangoDB document ID
 * @property gitSignature Combined "Name <email>" git signature format
 * @property iid Domain-level unique identifier (UUID-based)
 * @property repository Reference to the owning repository
 */
@Document("developers")
data class DeveloperEntity(
    @Id
    var id: String? = null,
    var gitSignature: String,
    val iid: Developer.Id,
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
     * Business key combining repository ID and email for uniqueness.
     */
    data class Key(val repositoryId: String?, val email: String)

    /**
     * Extracts the name portion from the git signature.
     * Format expected: "Name <email@example.com>"
     */
    val name: String
        get() {
            val nameRegex = Regex("""^(.+?)\s*<""")
            return nameRegex.find(gitSignature)?.groupValues?.get(1)?.trim()
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
     * Business key for entity lookups.
     */
    val uniqueKey: Key
        get() = Key(repositoryId = repository?.id, email = email)

    /**
     * Converts this entity to a domain Developer object.
     *
     * @param repository The domain repository (must be the owner)
     * @return The domain Developer
     */
    fun toDomain(): Developer =
        Developer(
            name = this.name,
            email = this.email,
            repositoryId = this.repository?.let { Repository.Id(it.iid) } ?: Repository.Id(this.iid.value),
            iid = this.iid,
        ).apply {
            this.id = this@DeveloperEntity.id
        }
}

/**
 * Extension function to convert a domain Developer to an ArangoDB entity.
 *
 * @param repository The repository entity (must be the owner)
 * @return The DeveloperEntity
 */
internal fun Developer.toArangoEntity(repository: RepositoryEntity): DeveloperEntity =
    DeveloperEntity(
        id = this.id,
        gitSignature = this.gitSignature,
        iid = this.iid,
        repository = repository,
    )
