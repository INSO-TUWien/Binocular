package com.inso_world.binocular.infrastructure.sql.persistence.entity

import com.inso_world.binocular.infrastructure.sql.persistence.converter.KotlinUuidConverter
import com.inso_world.binocular.infrastructure.sql.persistence.entity.DeveloperEntity
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.OneToMany
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import jakarta.validation.constraints.NotBlank
import org.hibernate.annotations.BatchSize

@Entity
@Table(name = "repositories")
internal data class RepositoryEntity(
    @Column(nullable = false, updatable = false, unique = true)
    @Convert(KotlinUuidConverter::class)
    val iid: Repository.Id,
    @Column(unique = true, nullable = false, updatable = false)
    @field:NotBlank
    var localPath: String,
    @BatchSize(size = 256)
    @OneToMany(
        fetch = FetchType.LAZY,
        cascade = [CascadeType.ALL],
        orphanRemoval = true,
        mappedBy = "repository",
    )
    var commits: MutableSet<CommitEntity> = mutableSetOf(),
    @BatchSize(size = 256)
    @OneToMany(
        fetch = FetchType.LAZY,
        targetEntity = DeveloperEntity::class,
        cascade = [CascadeType.ALL],
        orphanRemoval = true,
        mappedBy = "repository",
    )
    var developers: MutableSet<DeveloperEntity> = mutableSetOf(),
    @BatchSize(size = 256)
    @OneToMany(
        fetch = FetchType.LAZY,
        targetEntity = BranchEntity::class,
        cascade = [CascadeType.ALL],
        orphanRemoval = true,
        mappedBy = "repository",
    )
    var branches: MutableSet<BranchEntity> = mutableSetOf(),
    @BatchSize(size = 256)
    @OneToMany(
        fetch = FetchType.LAZY,
        targetEntity = RemoteEntity::class,
        cascade = [CascadeType.ALL],
        orphanRemoval = true,
        mappedBy = "repository",
    )
    var remotes: MutableSet<RemoteEntity> = mutableSetOf(),
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_project_id")
    var project: ProjectEntity,
) : AbstractEntity<Long, RepositoryEntity.Key>() {
    data class Key(
        val projectIid: Project.Id,
        val localPath: String,
    ) // value object for lookups

    init {
        // removed circular registration
    }

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    override var id: Long? = null

    override fun equals(other: Any?): Boolean = super.equals(other)

    fun addBranch(branch: BranchEntity): Boolean {
//        if (branch.repository != null && branch.repository != this) {
//            throw IllegalArgumentException("Trying to add a branch where branch.repository != this")
//        }

        return this.branches.add(branch)
//            .also { added ->
//            if (added) branch.repository = this
//        }
    }

    fun addCommit(commit: CommitEntity): Boolean {
//        if (commit.repository != null && commit.repository != this) {
//            throw IllegalArgumentException("Trying to add a commit where commit.repository != this")
//        }

        return commits
            .add(commit)
//            .also { added ->
//                if (added) commit.repository = this
//            }
    }

    fun addDeveloper(developer: DeveloperEntity): Boolean {
        if (developer.repository != this) {
            throw IllegalArgumentException("Trying to add a developer where developer.repository != this")
        }

        return this.developers.add(developer)
    }

    fun addRemote(remote: RemoteEntity): Boolean = this.remotes.add(remote)

    override val uniqueKey: Key
        get() = Key(project.iid, localPath)

    override fun hashCode(): Int = super.hashCode()

    override fun toString(): String = "RepositoryEntity(id=$id, localPath='$localPath')"

    fun toDomain(): Repository {
        val repo =
            Repository(
                localPath = this.localPath.trim(),
                projectId = this.project.iid
            ).apply {
                this.id = this@RepositoryEntity.id?.toString()
            }

        return repo
    }
}

internal fun Repository.toSqlEntity(project: ProjectEntity): RepositoryEntity =
    RepositoryEntity(
        iid = this.iid,
        localPath = this.localPath.trim(),
        project = project,
    ).apply { id = this@toSqlEntity.id?.trim()?.toLongOrNull() }
