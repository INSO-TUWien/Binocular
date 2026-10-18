package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.JobEntity
import com.inso_world.binocular.model.Job
import org.springframework.stereotype.Component
import java.time.ZoneOffset
import java.util.Date

/**
 * Mapper for Job value objects.
 *
 * Converts between Job domain value objects and JobEntity persistence entities for ArangoDB.
 * Jobs represent individual CI/CD pipeline jobs within a Build.
 *
 * ## Design Principles
 * - **Value Object**: Job is a value object typically embedded within Build
 * - **Date Conversion**: Converts between LocalDateTime and Date for ArangoDB storage
 *
 * ## Usage
 * This mapper is primarily used by BuildMapper to convert jobs within build entities.
 */
@Component
internal class JobMapper : EntityMapper<Job, JobEntity> {
    /**
     * Converts a Job value object to JobEntity.
     *
     * Converts timestamp fields from LocalDateTime to Date for ArangoDB storage.
     *
     * @param domain The Job value object to convert
     * @return The JobEntity with job metadata and timestamps
     */
    override fun toEntity(domain: Job): JobEntity =
        JobEntity(
            id = domain.id,
            name = domain.name,
            status = domain.status,
            stage = domain.stage,
            createdAt = domain.createdAt?.let { Date.from(it.toInstant(ZoneOffset.UTC)) },
            finishedAt = domain.finishedAt?.let { Date.from(it.toInstant(ZoneOffset.UTC)) },
            webUrl = domain.webUrl
        )

    /**
     * Converts a JobEntity to Job value object.
     *
     * Converts timestamp fields from Date to LocalDateTime.
     *
     * @param entity The JobEntity to convert
     * @return The Job value object with job metadata and timestamps
     */
    override fun toDomain(entity: JobEntity): Job {
        // Fast-path: Check if already mapped

        return Job(
            id = entity.id,
            name = entity.name,
            status = entity.status,
            stage = entity.stage,
            createdAt =
                entity.createdAt
                    ?.toInstant()
                    ?.atZone(ZoneOffset.UTC)
                    ?.toLocalDateTime(),
            finishedAt =
                entity.finishedAt
                    ?.toInstant()
                    ?.atZone(ZoneOffset.UTC)
                    ?.toLocalDateTime(),
            webUrl = entity.webUrl
        )
    }
}
