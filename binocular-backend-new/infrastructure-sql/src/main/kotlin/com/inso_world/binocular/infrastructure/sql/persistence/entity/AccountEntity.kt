package com.inso_world.binocular.infrastructure.sql.persistence.entity

import com.inso_world.binocular.infrastructure.sql.persistence.converter.KotlinUuidConverter
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Platform
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.ManyToMany
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint

/**
 * SQL-specific Account entity.
 */
@Entity
@Table(
    name = "accounts",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["gid", "platform"]),
    ],
)
internal data class AccountEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    override var id: Long? = null,
    @Column(nullable = false, updatable = false, unique = true)
    @Convert(KotlinUuidConverter::class)
    val iid: Account.Id,
    // @Column(nullable = false, updatable = false, unique = true)
    val gid: String,
    @Enumerated(EnumType.STRING)
    val platform: Platform,
    val login: String,
    var name: String?,
    @Column(name = "avatar_url")
    var avatarUrl: String? = null,
    var url: String? = null,
    @ManyToMany(mappedBy = "accounts")
    var issues: MutableList<IssueEntity> = mutableListOf(),
    //    @ManyToMany
    //    @JoinTable(
    //        name = "merge_request_account_connections",
    //        joinColumns = [JoinColumn(name = "account_id")],
    //        inverseJoinColumns = [JoinColumn(name = "merge_request_id")],
    //    )
    //    var mergeRequests: MutableList<MergeRequestEntity> = mutableListOf(),
    //    @ManyToMany
    //    @JoinTable(
    //        name = "note_account_connections",
    //        joinColumns = [JoinColumn(name = "account_id")],
    //        inverseJoinColumns = [JoinColumn(name = "note_id")],
    //    )
    //    var notes: MutableList<NoteEntity> = mutableListOf(),
    @ManyToMany(mappedBy = "accounts", fetch = FetchType.LAZY)
    var projects: MutableSet<ProjectEntity> = mutableSetOf()
) : AbstractEntity<Long, AccountEntity.Key>() {
    data class Key(
        val platform: Platform,
        val gid: String
    ) // value object for lookups

    //    override fun uniqueKey(): String {
//        return "${this.platform}:${this.gid}"
//    }
    override val uniqueKey: Key
        get() = Key(platform, gid)

    override fun equals(other: Any?) = super.equals(other)

    override fun hashCode(): Int = super.hashCode()

    fun toDomain(): Account =
        Account(
            gid = this.gid,
            platform = this.platform,
            login = this.login,
            projectIds = this.projects.map { it.iid }.toMutableSet(),
            iid = this.iid,
        ).apply {
            this.id = this@AccountEntity.id?.toString()
            this.name = this@AccountEntity.name
            this.avatarUrl = this@AccountEntity.avatarUrl
            this.url = this@AccountEntity.url
            this.issueIds.addAll(this@AccountEntity.issues.map { it.iid })
        }

    // Use direct entity relationships and map them to domain objects using the new createLazyMappedList method
//                issues =
//                    proxyFactory.createLazyMappedList(
//                        { entity.issues },
//                        { issueMapper.toDomain(it) },
//                    ),
//                mergeRequests =
//                    proxyFactory.createLazyMappedList(
//                        { entity.mergeRequests },
//                        { mergeRequestMapper.toDomain(it) },
//                    ),
//                notes =
//                    proxyFactory.createLazyMappedList(
//                        { entity.notes },
//                        { noteMapper.toDomain(it) },
//                    ),
}

internal fun Account.toSqlEntity(): AccountEntity =
    AccountEntity(
        iid = this.iid,
        gid = this.gid,
        platform = this.platform,
        login = this.login,
        name = this.name,
        avatarUrl = this.avatarUrl,
        url = this.url,
//        project = project,
        // Note: Relationships are not directly mapped in SQL entity
    ).apply {
        id = this@toSqlEntity.id?.trim()?.toLongOrNull()
    }
