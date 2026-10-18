@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.sql.persistence.entity

import com.inso_world.binocular.infrastructure.sql.persistence.converter.KotlinUuidConverter
import com.inso_world.binocular.infrastructure.sql.persistence.entity.DeveloperEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.RepositoryEntity.Key
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.Mention
import com.inso_world.binocular.model.Project
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
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import jakarta.persistence.Temporal
import jakarta.persistence.TemporalType
import java.time.LocalDateTime
import java.util.Objects
import kotlin.uuid.ExperimentalUuidApi

/**
 * SQL-specific Issue entity.
 */
@Entity
@Table(name = "issues")
internal data class IssueEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    override var id: Long? = null,
    val gid: String, // external GitHub id
    val platformIid: Int? = null, // issue number from e.g. GitHub
    @Convert(KotlinUuidConverter::class)
    var iid: Issue.Id,
    var title: String? = null,
    @Column(columnDefinition = "TEXT")
    var description: String? = null,
    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    var createdAt: LocalDateTime? = null,
    @Column(name = "closed_at")
    @Temporal(TemporalType.TIMESTAMP)
    var closedAt: LocalDateTime? = null,
    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    var updatedAt: LocalDateTime? = null,
    var state: String? = null,
    @Column(name = "web_url")
    var webUrl: String? = null,
    // project connection
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false, updatable = false)
    var project: ProjectEntity,
    @OneToMany(mappedBy = "issue", cascade = [jakarta.persistence.CascadeType.ALL], orphanRemoval = true)
    var labels: MutableList<LabelEntity> = mutableListOf(),
    @OneToMany(mappedBy = "issue", cascade = [jakarta.persistence.CascadeType.ALL], orphanRemoval = true)
    var mentions: MutableList<MentionEntity> = mutableListOf(),
    @ManyToMany
    @JoinTable(
        name = "issue_account_connections",
        joinColumns = [JoinColumn(name = "issue_id")],
        inverseJoinColumns = [JoinColumn(name = "account_id")],
    )
    var accounts: MutableSet<AccountEntity> = mutableSetOf(),
    @ManyToMany
    @JoinTable(
        name = "issue_commit_connections",
        joinColumns = [JoinColumn(name = "issue_id")],
        inverseJoinColumns = [JoinColumn(name = "commit_id")],
    )
    var commits: MutableList<CommitEntity> = mutableListOf(),
    @ManyToMany
    @JoinTable(
        name = "issue_milestone_connections",
        joinColumns = [JoinColumn(name = "issue_id")],
        inverseJoinColumns = [JoinColumn(name = "milestone_id")],
    )
    var milestones: MutableList<MilestoneEntity> = mutableListOf(),
    @ManyToMany
    @JoinTable(
        name = "issue_note_connections",
        joinColumns = [JoinColumn(name = "issue_id")],
        inverseJoinColumns = [JoinColumn(name = "note_id")],
    )
    var notes: MutableList<NoteEntity> = mutableListOf(),
    @ManyToMany
    @JoinTable(
        name = "issue_user_connections",
        joinColumns = [JoinColumn(name = "issue_id")],
        inverseJoinColumns = [JoinColumn(name = "user_id")],
    )
    var developers: MutableList<DeveloperEntity> = mutableListOf(),
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", updatable = false)
    var author: AccountEntity? = null
) : AbstractEntity<Long, IssueEntity.Key>() {
    data class Key(
        val projectId: Project.Id,
        val gid: String
    )

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is IssueEntity) return false
        return iid == other.iid && gid == other.gid && project.iid == other.project.iid
    }

    override fun hashCode(): Int = Objects.hash(iid, gid, project.iid)

    fun addAccount(account: AccountEntity) {
        if (accounts.contains(account)) return

        accounts.add(account)
        account.issues.add(this)
    }

    /**
     * Gets the mentions as domain model mentions
     */
    fun getDomainMentions(): List<Mention> =
        mentions.map {
            Mention(
                commit = it.commit,
                createdAt = it.createdAt,
                closes = it.closes
            )
        }

    /**
     * Sets the mentions from domain model mentions
     */
    fun setDomainMentions(mentions: List<Mention>) {
        this.mentions.clear()
        this.mentions.addAll(
            mentions.map {
                MentionEntity(
                    id = null,
                    commit = it.commit,
                    createdAt = it.createdAt,
                    closes = it.closes,
                    issue = this
                )
            }
        )
    }

    /**
     * Gets the labels as domain model labels
     */
    fun getDomainLabels(): List<String> = labels.map { it.value }

    /**
     * Sets the labels from domain model labels
     */
    fun setDomainLabels(labels: List<String>) {
        this.labels.clear()
        this.labels.addAll(labels.map { LabelEntity(null, it, this) })
    }

    @OptIn(ExperimentalUuidApi::class)
    fun toDomain(): Issue =
        Issue(
            project = this.project.iid,
            gid = this.gid,
            platformIid = this.platformIid,
            title = this.title,
            description = this.description,
            createdAt = this.createdAt,
            closedAt = this.closedAt,
            updatedAt = this.updatedAt,
            labels = this.getDomainLabels(),
            state = this.state,
            webUrl = this.webUrl,
            mentions = this.getDomainMentions(),
            authorId = this.author?.iid,
            accountIds = this.accounts.map { it.iid }.toSet(),
            commitIds = this.commits.map { it.iid }.toSet(),
            milestoneIds = this.milestones.map { it.iid }.toSet(),
            noteIds = this.notes.map { it.iid }.toSet(),
            developerIds = this.developers.map { it.iid }.toSet(),
            iid = this.iid,
        ).apply {
            id = this@IssueEntity.id?.toString()
        }

    override val uniqueKey: Key
        get() = Key(project.iid, gid)

    override fun toString(): String = "IssueEntity(id=$id, gid=$gid, title=$title)"
}

internal fun Issue.toSqlEntity(owner: ProjectEntity): IssueEntity {
    val entity =
        IssueEntity(
            id = this.id?.toLong(),
            iid = this.iid,
            title = this.title,
            description = this.description,
            createdAt = this.createdAt,
            closedAt = this.closedAt,
            updatedAt = this.updatedAt,
            state = this.state,
            webUrl = this.webUrl,
            gid = this.gid,
            platformIid = this.platformIid,
            project = owner,
        )
    return entity
}
