package com.inso_world.binocular.infrastructure.arangodb.persistence.entity

import com.arangodb.springframework.annotation.Document
import com.arangodb.springframework.annotation.Field
import com.arangodb.springframework.annotation.PersistentIndexed
import com.arangodb.springframework.annotation.Ref
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import org.springframework.data.annotation.Id
import kotlin.uuid.Uuid

/**
 * ArangoDB-specific Repository entity.
 *
 * Represents the persistence layer for the [Repository][com.inso_world.binocular.model.Repository] domain object.
 *
 * ### Identity Mapping
 * - [id]: ArangoDB internal document ID (_key)
 * - [iid]: Domain immutable identity (UUID)
 * - [localPath]: Business key component along with project
 *
 * ### Relationships
 * - [project]: Owning project (required, establishes bidirectional link)
 *
 * ### Indexes
 * - [iid]: Unique persistent index for UUID-based lookups
 */
@Document("repositories")
data class RepositoryEntity(
    @Id
    var id: String? = null,
    @Field("iid")
    @PersistentIndexed(unique = true)
    var iid: Uuid,
    var localPath: String,
    @Ref(lazy = true)
    var project: ProjectEntity? = null
) {
    init {
        this.project?.repository = this
    }

    @Ref
    var commits: List<CommitEntity> = emptyList()

    @Ref
    var branches: List<BranchEntity> = emptyList()

    @Ref
    var developers: List<DeveloperEntity> = emptyList()

    @Ref
    var remotes: List<RemoteEntity> = emptyList()

    @Ref
    var files: List<FileEntity> = emptyList()

    @Ref
    var revisions: List<RevisionEntity> = emptyList()

    /**
     * Converts this RepositoryEntity to a Repository domain object.
     *
     * @return Repository domain object
     */
    fun toDomain(): Repository =
        Repository(
            localPath = this.localPath.trim(),
            projectId = this.project?.let { Project.Id(it.iid) } ?: Project.Id(this.iid),
        ).apply {
            this.id = this@RepositoryEntity.id
        }
}

/**
 * Converts a Repository domain object to RepositoryEntity.
 *
 * @param project The ProjectEntity to associate with the repository
 * @return RepositoryEntity for persistence
 */
internal fun Repository.toArangoEntity(project: ProjectEntity): RepositoryEntity =
    RepositoryEntity(
        id = this.id,
        iid = this.iid.value,
        localPath = this.localPath.trim(),
        project = project
    )
