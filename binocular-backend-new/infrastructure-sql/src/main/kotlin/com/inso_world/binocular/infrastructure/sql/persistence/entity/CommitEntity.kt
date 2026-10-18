package com.inso_world.binocular.infrastructure.sql.persistence.entity

import com.inso_world.binocular.infrastructure.sql.persistence.converter.KotlinUuidConverter
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Signature
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.JoinColumn
import jakarta.persistence.JoinTable
import jakarta.persistence.Lob
import jakarta.persistence.ManyToMany
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import jakarta.validation.constraints.Size
import org.hibernate.annotations.BatchSize
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction
import java.time.LocalDateTime

@Entity
@Table(
    name = "commits",
    indexes = [Index(name = "idx_sha", columnList = "sha")],
    uniqueConstraints = [],
)
internal data class CommitEntity(
    @Column(nullable = false, updatable = false, unique = true)
    @Convert(KotlinUuidConverter::class)
    val iid: Commit.Id,
    @Column(unique = true, updatable = false)
    @field:Size(min = 40, max = 40)
    val sha: String,
    @Column(name = "author_dt", nullable = false)
    var authorDateTime: LocalDateTime,
    @Column(name = "commit_dt", nullable = false)
    var commitDateTime: LocalDateTime,
    @Column(columnDefinition = "TEXT")
    @Lob
    var message: String? = null,
    @Column(name = "web_url")
    var webUrl: String? = null,
    @Deprecated("do not use")
    var branch: String? = null,
    @BatchSize(size = 256)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "commit_parents",
        joinColumns = [JoinColumn(name = "child_id")],
        inverseJoinColumns = [JoinColumn(name = "parent_id")],
        uniqueConstraints = [UniqueConstraint(columnNames = ["child_id", "parent_id"])],
        indexes = [
            Index(name = "child_idx", columnList = "child_id"),
            Index(name = "parent_idx", columnList = "parent_id"),
            Index(name = "combined_idx", columnList = "child_id,parent_id"),
        ],
    )
    var parents: MutableSet<CommitEntity> = mutableSetOf(),
    @BatchSize(size = 256)
    @ManyToMany(mappedBy = "parents", fetch = FetchType.LAZY)
    var children: MutableSet<CommitEntity> = mutableSetOf(),
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    var author: DeveloperEntity,
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "committer_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    var committer: DeveloperEntity,
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "repository_id", nullable = false, updatable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    val repository: RepositoryEntity,
) : AbstractEntity<Long, CommitEntity.Key>() {
    data class Key(
        val sha: String,
    )

    init {
        // removed circular registration
    }

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    override var id: Long? = null

    override val uniqueKey: Key
        get() = Key(this.sha)

    override fun equals(other: Any?): Boolean = super.equals(other)

    override fun hashCode(): Int = super.hashCode()

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
            repositoryId = repository.iid,
            message = this.message,
        ).apply {
            this.id = this@CommitEntity.id?.toString()
            this.webUrl = this@CommitEntity.webUrl
            this.parentShas.addAll(this@CommitEntity.parents.map { it.sha })
            this.childShas.addAll(this@CommitEntity.children.map { it.sha })
        }
    }

    override fun toString(): String =
        "CommitEntity(id=$id, sha='$sha', authorDateTime=$authorDateTime, commitDateTime=$commitDateTime, repository=${repository.localPath})"
}

internal fun Commit.toSqlEntity(
    repository: RepositoryEntity,
    author: DeveloperEntity,
    committer: DeveloperEntity,
): CommitEntity =
    CommitEntity(
        iid = this.iid,
        sha = this.sha,
        authorDateTime = this.authorSignature.timestamp,
        commitDateTime = (this.committerSignature ?: this.authorSignature).timestamp,
        message = this.message,
        webUrl = this.webUrl,
        repository = repository,
        parents = mutableSetOf(),
        children = mutableSetOf(),
        author = author,
        committer = committer,
    ).apply {
        this.id = this@toSqlEntity.id?.trim()?.toLongOrNull()
    }
