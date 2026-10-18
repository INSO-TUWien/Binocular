package com.inso_world.binocular.infrastructure.sql.persistence.entity

import com.inso_world.binocular.infrastructure.sql.persistence.converter.KotlinUuidConverter
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Reference
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.vcs.ReferenceCategory
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint

/**
 * SQL-specific Branch entity.
 */
@Entity
@Table(
    name = "branches",
    indexes = [Index(name = "idx_name", columnList = "name")],
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["repository_id", "name"]),
    ],
)
internal data class BranchEntity(
    @Column(nullable = false)
    val name: String,
    @Column(name = "full_name", nullable = false)
    val fullName: String,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    val category: ReferenceCategory,
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_commit_id", nullable = false, updatable = true)
    val head: CommitEntity,
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "repository_id", nullable = false, updatable = false)
    val repository: RepositoryEntity,
    @Column(nullable = false, updatable = false, unique = true)
    @Convert(KotlinUuidConverter::class)
    val iid: Reference.Id
) : AbstractEntity<Long, BranchEntity.Key>() {
    data class Key(
        val repositoryIid: Repository.Id,
        val name: String
    )

    init {
        // removed circular registration
    }

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    override var id: Long? = null

    fun toDomain(): Branch =
        Branch(
            name = this.name,
            fullName = this.fullName,
            category = this.category,
            repositoryId = this.repository.iid,
            headSha = this.head.sha,
        ).apply {
            this.id = this@BranchEntity.id?.toString()
        }

    override fun equals(other: Any?): Boolean = super.equals(other)

    override fun hashCode(): Int = super.hashCode()

    override fun toString(): String = "BranchEntity(id=$id, name='$name', headId=${head.id})"

    override val uniqueKey: Key
        get() =
            Key(
                repository.iid,
                name
            )
}

internal fun Branch.toSqlEntity(
    repository: RepositoryEntity,
    head: CommitEntity
): BranchEntity =
    BranchEntity(
        iid = this.iid,
        name = this.name,
        fullName = this.fullName,
        category = this.category,
        repository = repository,
        head = head,
    ).apply {
        id = this@toSqlEntity.id?.trim()?.toLongOrNull()
    }
