package com.inso_world.binocular.infrastructure.sql.persistence.entity

import com.inso_world.binocular.infrastructure.sql.persistence.converter.KotlinUuidConverter
import com.inso_world.binocular.model.Milestone
import com.inso_world.binocular.model.Project
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.ManyToMany
import jakarta.persistence.Table
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * SQL-specific Milestone entity.
 */
@Entity
@Table(name = "milestones")
@OptIn(ExperimentalUuidApi::class)
internal data class MilestoneEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    var id: Long? = null,
    @Convert(KotlinUuidConverter::class)
    var iid: Milestone.Id,
    var platformIid: Int? = null,
    var title: String? = null,
    @Column(columnDefinition = "TEXT")
    var description: String? = null,
    @Column(name = "created_at")
    var createdAt: String? = null,
    @Column(name = "updated_at")
    var updatedAt: String? = null,
    @Column(name = "start_date")
    var startDate: String? = null,
    @Column(name = "due_date")
    var dueDate: String? = null,
    var state: String? = null,
    var expired: Boolean? = null,
    @Column(name = "web_url")
    var webUrl: String? = null,
    @ManyToMany(mappedBy = "milestones")
    var issues: MutableList<IssueEntity> = mutableListOf(),
) {
    fun toDomain(projectId: Project.Id = Project.Id(Uuid.parse("00000000-0000-0000-0000-000000000000"))): Milestone =
        Milestone(
            id = this.id?.toString(),
            platformIid = this.platformIid,
            title = this.title,
            description = this.description,
            createdAt = this.createdAt,
            updatedAt = this.updatedAt,
            startDate = this.startDate,
            dueDate = this.dueDate,
            state = this.state,
            expired = this.expired,
            webUrl = this.webUrl,
            project = projectId,
            iid = this.iid,
            issueIds = this.issues.map { it.iid }.toMutableSet()
        )
}
