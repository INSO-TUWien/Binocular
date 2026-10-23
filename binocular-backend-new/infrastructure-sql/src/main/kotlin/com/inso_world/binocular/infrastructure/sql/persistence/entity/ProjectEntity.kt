package com.inso_world.binocular.infrastructure.sql.persistence.entity

import com.inso_world.binocular.infrastructure.sql.persistence.converter.KotlinUuidConverter
import com.inso_world.binocular.model.Project
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.JoinTable
import jakarta.persistence.ManyToMany
import jakarta.persistence.OneToMany
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import jakarta.validation.constraints.NotBlank

@Entity
@Table(name = "projects", uniqueConstraints = [UniqueConstraint(columnNames = ["name"])])
internal data class ProjectEntity(
    @Column(nullable = false, unique = true, updatable = false) @field:NotBlank val name: String,
    @Column(nullable = false, updatable = false, unique = true)
    @Convert(KotlinUuidConverter::class)
    val iid: Project.Id
) : AbstractEntity<Long, ProjectEntity.Key>() {
    @Column(nullable = true, unique = false, length = MAX_DESCRIPTION_LENGTH)
    var description: String? = null
        set(value) {
            require(value == null || value.length <= MAX_DESCRIPTION_LENGTH) {
                "Description must not exceed $MAX_DESCRIPTION_LENGTH characters."
            }
            field = value
        }

    data class Key(
        val name: String,
    ) // value object for lookups

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    override var id: Long? = null

    @OneToOne(
        cascade = [CascadeType.ALL],
        optional = true,
        mappedBy = "project",
    )
    var repo: RepositoryEntity? = null
        set(value) {
            requireNotNull(value) { "Cannot set repo to null" }
            if (value == this.repo) {
                return
            }
            if (this.repo != null) {
                throw IllegalArgumentException("Repository already set for Project $repo")
            }
            field = value
        }

    @OneToMany(
        fetch = FetchType.LAZY,
        cascade = [CascadeType.ALL],
        mappedBy = "project",
        orphanRemoval = true,
    )
    var issues: MutableSet<IssueEntity> = mutableSetOf()

    @OneToMany(
        fetch = FetchType.LAZY,
        cascade = [CascadeType.ALL],
        mappedBy = "project",
        orphanRemoval = true,
    )
    var mergeRequests: MutableSet<MergeRequestEntity> = mutableSetOf()

    @ManyToMany(
        fetch = FetchType.LAZY,
        cascade = [CascadeType.ALL]
    )
    @JoinTable(
        name = "project_account",
        joinColumns = [JoinColumn(name = "fk_project_id")],
        inverseJoinColumns = [JoinColumn(name = "fk_account_id")]
    )
    var accounts: MutableSet<AccountEntity> = mutableSetOf()

    fun addIssue(issue: IssueEntity): Boolean {
        if (issue.project != null && issue.project != this) {
            throw IllegalArgumentException("Trying to add an issue where project is another project")
        }

        return this.issues.add(issue).also { added ->
            if (added) issue.project = this
        }
    }

    fun addAccount(account: AccountEntity): Boolean {
        val added = accounts.add(account)
        if (added) {
            account.projects.add(this)
        }
        return added
    }

    override fun toString(): String = "ProjectEntity(id=$id, iid=$iid, name=$name, description=$description)"

    fun toStringDebug(): String = "ProjectEntity(id=$id, name=$name, accountCount=${accounts.size}, issueCount=${issues.size})"

    override val uniqueKey: ProjectEntity.Key
        get() = ProjectEntity.Key(this.name)

    // Entities compare by immutable identity only
    override fun equals(other: Any?) = super.equals(other)

    override fun hashCode(): Int = super.hashCode()

    fun toDomain(): Project =
        Project(
            name = this.name,
        ).apply {
            this.id = this@ProjectEntity.id?.toString()
            this.description = this@ProjectEntity.description
        }

    companion object {
        private const val MAX_DESCRIPTION_LENGTH = 255
    }
}

internal fun Project.toSqlEntity(): ProjectEntity =
    ProjectEntity(
        iid = this.iid,
        name = this@toSqlEntity.name,
    ).apply {
        id = this@toSqlEntity.id?.trim()?.toLongOrNull()
        description = this@toSqlEntity.description
    }
