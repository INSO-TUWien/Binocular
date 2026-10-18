@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.sql.persistence.entity

import com.inso_world.binocular.infrastructure.sql.persistence.converter.KotlinUuidConverter
import com.inso_world.binocular.model.Note
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.JoinTable
import jakarta.persistence.ManyToMany
import jakarta.persistence.Table
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * SQL-specific Note entity.
 */
@Entity
@Table(name = "notes")
internal data class NoteEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    var id: Long? = null,
    @Column(nullable = false, updatable = false, unique = true)
    @Convert(KotlinUuidConverter::class)
    var iid: Note.Id,
    @Column(columnDefinition = "TEXT")
    var body: String,
    @Column(name = "created_at")
    var createdAt: String = "",
    @Column(name = "updated_at")
    var updatedAt: String = "",
    var system: Boolean = true,
    var resolvable: Boolean = false,
    var confidential: Boolean = false,
    var internal: Boolean = false,
    var imported: Boolean = false,
    @Column(name = "imported_from")
    var importedFrom: String = "",
    @ManyToMany
    @JoinTable(
        name = "note_account_connections",
        joinColumns = [JoinColumn(name = "note_id")],
        inverseJoinColumns = [JoinColumn(name = "account_id")],
    )
    var accounts: MutableList<AccountEntity> = mutableListOf(),
    @ManyToMany(mappedBy = "notes")
    var issues: MutableList<IssueEntity> = mutableListOf(),
    @ManyToMany(mappedBy = "notes")
    var mergeRequests: MutableList<MergeRequestEntity> = mutableListOf(),
) {
    // Default constructor for Hibernate
    constructor() : this(
        iid = Note.Id(kotlin.uuid.Uuid.parse("00000000-0000-0000-0000-000000000000")),
        body = "",
        createdAt = "",
        updatedAt = "",
        system = true,
        resolvable = false,
        confidential = false,
        internal = false,
        imported = false,
        importedFrom = "",
        accounts = mutableListOf(),
        issues = mutableListOf(),
        mergeRequests = mutableListOf(),
    )

    fun toDomain(): Note =
        Note(
            id = this.id?.toString(),
            body = this.body,
            createdAt = this.createdAt,
            updatedAt = this.updatedAt,
            system = this.system,
            resolvable = this.resolvable,
            confidential = this.confidential,
            internal = this.internal,
            imported = this.imported,
            importedFrom = this.importedFrom,
            iid = this.iid,
            issueIds = this.issues.map { it.iid }.toMutableSet(),
            mergeRequestIds = this.mergeRequests.map { it.iid }.toMutableSet(),
        ).apply {
            accountIds.addAll(this@NoteEntity.accounts.map { it.iid })
        }
}

internal fun Note.toSqlEntity(): NoteEntity =
    NoteEntity(
        id = this.id?.toLongOrNull(),
        iid = this.iid,
        body = this.body,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        system = this.system,
        resolvable = this.resolvable,
        confidential = this.confidential,
        internal = this.internal,
        imported = this.imported,
        importedFrom = this.importedFrom
    )
