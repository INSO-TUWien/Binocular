package com.inso_world.binocular.infrastructure.sql.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
//import jakarta.persistence.JoinColumn
//import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

@Entity
@Table(name = "lizard_file_analysis")
internal data class LizardFileAnalysisEntity(
//    @ManyToOne(optional = false)
//    @JoinColumn(name = "file_id", nullable = false)
//    val file: FileEntity,

    @Column(name = "file_path", nullable = false, length = 1024)
    val filePath: String,
) : AbstractEntity<Long, LizardFileAnalysisEntity.Key>() {

    data class Key(val id: Long?)

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    override var id: Long? = null

    @Column(name = "max_nloc")
    var maxNloc: Double = 0.0

    @Column(name = "max_ccn")
    var maxCcn: Double = 0.0

    @Column(name = "max_tokens")
    var maxTokens: Double = 0.0

    @Column(name = "max_parameters")
    var maxParameters: Double = 0.0

    @Column(name = "max_length")
    var maxLength: Double = 0.0

    @Column(name = "avg_nloc")
    var avgNloc: Double = 0.0

    @Column(name = "avg_ccn")
    var avgCcn: Double = 0.0

    @Column(name = "avg_tokens")
    var avgTokens: Double = 0.0

    @Column(name = "avg_parameters")
    var avgParameters: Double = 0.0

    @Column(name = "avg_length")
    var avgLength: Double = 0.0

    @Column(name = "function_count")
    var functionCount: Int = 0

    @Column(name = "max_lizard_score")
    var maxLizardScore: Double = 0.0

    @Column(name = "avg_lizard_score")
    var avgLizardScore: Double = 0.0

    @Column(name = "normalized_max_lizard_score")
    var normalizedMaxLizardScore: Double = 0.0

    @Column(name = "normalized_avg_lizard_score")
    var normalizedAvgLizardScore: Double = 0.0

    override val uniqueKey: Key
        get() = Key(id)

    override fun equals(other: Any?) = super.equals(other)
    override fun hashCode(): Int = super.hashCode()
}
