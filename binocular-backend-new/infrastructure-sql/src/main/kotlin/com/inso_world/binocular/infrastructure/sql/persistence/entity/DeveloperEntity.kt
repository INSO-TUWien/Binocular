package com.inso_world.binocular.infrastructure.sql.persistence.entity

import com.inso_world.binocular.infrastructure.sql.persistence.converter.KotlinUuidConverter
import com.inso_world.binocular.model.Developer
import com.inso_world.binocular.model.Repository
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint

/**
 * SQL-specific Developer entity stored in the legacy `users` table.
 *
 * This maps the refactored domain `Developer` (required name + email) while
 * keeping the existing table name/constraints for compatibility.
 */
@Entity
@Table(
    name = "users",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["repository_id", "email"]),
    ],
)
internal data class DeveloperEntity(
    @Column(nullable = false)
    var name: String,
    @Column(nullable = false)
    var email: String,
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "repository_id", nullable = false, updatable = false)
    var repository: RepositoryEntity,
    @Column(nullable = false, updatable = false, unique = true)
    @Convert(KotlinUuidConverter::class)
    val iid: Developer.Id,
) : AbstractEntity<Long, DeveloperEntity.Key>() {
    data class Key(
        val repositoryIid: Repository.Id,
        val email: String,
    )

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    override var id: Long? = null

    init {
        // removed circular registration
    }

    override val uniqueKey: Key
        get() = Key(repositoryIid = repository.iid, email = email)

    override fun equals(other: Any?): Boolean = super.equals(other)

    override fun hashCode(): Int = super.hashCode()

    fun toDomain(): Developer =
        Developer(
            name = this.name,
            email = this.email,
            repositoryId = this.repository.iid,
        ).apply {
            this.id = this@DeveloperEntity.id?.toString()
        }

    @OptIn(kotlin.uuid.ExperimentalUuidApi::class)
    fun toLegacyUser(): com.inso_world.binocular.model.User =
        com.inso_world.binocular.model
            .User(
                name = this.name,
                repositoryId = this.repository.iid
            ).apply {
                this.id = this@DeveloperEntity.id?.toString()
                this.email = this@DeveloperEntity.email
            }

    override fun toString(): String = "DeveloperEntity(id=$id, iid=$iid, name='$name', email='$email', repositoryId=${repository.id})"
}

internal fun Developer.toSqlEntity(repository: RepositoryEntity): DeveloperEntity =
    DeveloperEntity(
        iid = this.iid,
        email = this.email,
        name = this.name,
        repository = repository,
    ).apply {
        id = this@toSqlEntity.id?.trim()?.toLongOrNull()
    }
