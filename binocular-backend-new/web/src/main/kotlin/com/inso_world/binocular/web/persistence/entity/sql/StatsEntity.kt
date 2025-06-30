package com.inso_world.binocular.web.persistence.entity.sql

import jakarta.persistence.*

/**
 * SQL-specific Stats entity for storing commit statistics.
 */
@Entity
@Table(name = "stats")
class StatsEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  var id: Long? = null

  var additions: Long = 0L
  var deletions: Long = 0L

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(
    name = "commit_id", 
    foreignKey = ForeignKey(
      name = "fk_stats_commit",
      foreignKeyDefinition = "FOREIGN KEY (commit_id) REFERENCES commits(id) ON DELETE CASCADE"
    )
  )
  var commit: CommitEntity? = null

  // No-arg constructor required by JPA
  constructor()

  // Secondary constructor for convenience
  constructor(
    id: Long? = null,
    additions: Long,
    deletions: Long,
    commit: CommitEntity? = null
  ) {
    this.id = id
    this.additions = additions
    this.deletions = deletions
    this.commit = commit
  }
}
