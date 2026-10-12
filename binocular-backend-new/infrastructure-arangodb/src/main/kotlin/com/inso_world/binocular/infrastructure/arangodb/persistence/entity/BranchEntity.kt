@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)
package com.inso_world.binocular.infrastructure.arangodb.persistence.entity

import com.arangodb.springframework.annotation.Document
import com.arangodb.springframework.annotation.Field
import com.arangodb.springframework.annotation.PersistentIndexed
import com.arangodb.springframework.annotation.Ref
import com.arangodb.springframework.annotation.Relations
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.BranchFileConnectionEntity
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Reference
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.vcs.ReferenceCategory
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.Transient
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * ArangoDB-specific Branch entity.
 *
 * Represents the persistence layer for the [Branch][com.inso_world.binocular.model.Branch] domain object.
 *
 * ### Identity Mapping
 * - [id]: ArangoDB internal document ID (_key)
 * - [iid]: Domain immutable identity (UUID)
 * - [name]: Branch name (business key component with repository)
 *
 * ### Relationships
 * - [repository]: Owning repository (required)
 * - [head]: Head commit reference (required)
 * - [files]: Related files via edge collection
 *
 * ### Indexes
 * - [iid]: Unique persistent index for UUID-based lookups
 */
@OptIn(ExperimentalUuidApi::class)
@Document("branches")
data class BranchEntity(
    @Id
    var id: String? = null,
    @Field("iid")
    @PersistentIndexed(unique = true)
    var iid: Uuid,
    var name: String,
    var fullName: String,
    var category: String,
    var active: Boolean = false,
    var tracksFileRenames: Boolean = false,
    @Deprecated("Use head.sha instead")
    var latestCommit: String? = null,
    var branch: String? = null,
    @Ref(lazy = false)
    val repository: RepositoryEntity,
    @Ref(lazy = false)
    val head: CommitEntity,
    @Relations(
        edges = [BranchFileConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.OUTBOUND,
    )
    var files: Set<FileEntity> = emptySet(),
) {

    /**
     * Converts this BranchEntity to a Branch domain object.
     *
     * @param repository The repository domain object to associate with the branch
     * @param head The head commit domain object
     * @return Branch domain object
     */
    fun toDomain(): Branch {
        return Branch(
            name = this.name,
            fullName = this.fullName,
            category = ReferenceCategory.valueOf(this.category),
            repositoryId = Repository.Id(this.repository.iid),
            headSha = this.head.sha,
        ).apply {
            this.id = this@BranchEntity.id
            this.active = this@BranchEntity.active
            this.tracksFileRenames = this@BranchEntity.tracksFileRenames
        }
    }
}

/**
 * Converts a Branch domain object to BranchEntity.
 *
 * @param repository The RepositoryEntity to associate with the branch
 * @param head The head CommitEntity
 * @return BranchEntity for persistence
 */
@OptIn(ExperimentalUuidApi::class)
internal fun Branch.toArangoEntity(repository: RepositoryEntity, head: CommitEntity): BranchEntity =
    BranchEntity(
        id = this.id,
        iid = this.iid.value,
        name = this.name,
        fullName = this.fullName,
        category = this.category.name,
        active = this.active,
        tracksFileRenames = this.tracksFileRenames,
        latestCommit = this.headSha,
        branch = this.name,
        repository = repository,
        head = head,
    )
