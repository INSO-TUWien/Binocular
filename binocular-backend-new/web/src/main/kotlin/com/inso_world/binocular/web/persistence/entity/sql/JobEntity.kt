package com.inso_world.binocular.web.persistence.entity.sql

import jakarta.persistence.*
import java.util.*

/**
 * SQL-specific Job entity for storing build jobs.
 */
@Entity
@Table(name = "jobs")
class JobEntity {
  @Id
  var id: String? = null

  var name: String? = null
  var status: String? = null
  var stage: String? = null

  @Column(name = "created_at")
  @Temporal(TemporalType.TIMESTAMP)
  var createdAt: Date? = null

  @Column(name = "finished_at")
  @Temporal(TemporalType.TIMESTAMP)
  var finishedAt: Date? = null

  @Column(name = "web_url")
  var webUrl: String? = null

  @Column(name = "build_id", insertable = false, updatable = false)
  var buildId: String? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "build_id")
  var build: BuildEntity? = null

  // No-arg constructor required by JPA
  constructor()

  // Secondary constructor for convenience
  constructor(
    id: String? = null,
    name: String? = null,
    status: String? = null,
    stage: String? = null,
    createdAt: Date? = null,
    finishedAt: Date? = null,
    webUrl: String? = null,
    buildId: String? = null,
    build: BuildEntity? = null
  ) {
    this.id = id
    this.name = name
    this.status = status
    this.stage = stage
    this.createdAt = createdAt
    this.finishedAt = finishedAt
    this.webUrl = webUrl
    this.buildId = buildId
    this.build = build
  }
}
