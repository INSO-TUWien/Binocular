package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.StatsEntity
import com.inso_world.binocular.model.Stats
import org.springframework.stereotype.Component

/**
 * Mapper for Stats value objects.
 *
 * Converts between Stats domain value objects and StatsEntity persistence entities for ArangoDB.
 * This is a simple value object mapper without complex relationships or lifecycle management.
 *
 * ## Design Principles
 * - **Value Object**: Stats is an immutable value object representing commit statistics
 * - **Simple Mapping**: Direct property-to-property conversion without relationships
 *
 * ## Usage
 * This mapper is used by CommitMapper and other mappers that need to persist commit statistics.
 */
@Component
internal class StatsMapper : EntityMapper<Stats, StatsEntity> {
    /**
     * Converts a Stats value object to StatsEntity.
     *
     * @param domain The Stats value object to convert
     * @return The StatsEntity with additions and deletions counts
     */
    override fun toEntity(domain: Stats): StatsEntity =
        StatsEntity(
            additions = domain.additions,
            deletions = domain.deletions
        )

    /**
     * Converts a StatsEntity to Stats value object.
     *
     * @param entity The StatsEntity to convert
     * @return The Stats value object with additions and deletions counts
     */
    override fun toDomain(entity: StatsEntity): Stats {
        // Fast-path: Check if already mapped

        return Stats(
            additions = entity.additions,
            deletions = entity.deletions
        )
    }
}
