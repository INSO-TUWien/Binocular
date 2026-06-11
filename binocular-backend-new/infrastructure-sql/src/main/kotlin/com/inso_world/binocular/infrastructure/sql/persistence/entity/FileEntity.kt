package com.inso_world.binocular.infrastructure.sql.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

@Entity
@Table(name = "files")
internal data class FileEntity(
    @Column(name = "path", nullable = false)
    val path: String,

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "repository_id", nullable = false)
    val repository: RepositoryEntity,
) : AbstractEntity<Long, FileEntity.Key>() {

    data class Key(val id: Long?)

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    override var id: Long? = null

    @Column(name = "web_url")
    var webUrl: String? = null

    @Column(name = "max_length")
    var maxLength: Int? = null

    override val uniqueKey: Key
        get() = Key(id)

    override fun equals(other: Any?) = super.equals(other)
    override fun hashCode(): Int = super.hashCode()
}
