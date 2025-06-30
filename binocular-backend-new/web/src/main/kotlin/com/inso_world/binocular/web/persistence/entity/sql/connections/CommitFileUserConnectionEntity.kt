package com.inso_world.binocular.web.persistence.entity.sql.connections

import com.inso_world.binocular.web.persistence.entity.sql.CommitEntity
import com.inso_world.binocular.web.persistence.entity.sql.FileEntity
import com.inso_world.binocular.web.persistence.entity.sql.UserEntity
import jakarta.persistence.*

/**
 * SQL-specific entity for a connection between a Commit, File and a User.
 */
@Entity
@Table(name = "commit_file_user_connections")
data class CommitFileUserConnectionEntity(
  @Id
  var id: String? = null,

  @Column(name = "commit_id", insertable = false, updatable = false)
  var commitId: String? = null,

  @Column(name = "file_id", insertable = false, updatable = false)
  var fileId: String,

  @Column(name = "user_id", insertable = false, updatable = false)
  var userId: String,

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "commit_id")
  var commit: CommitEntity? = null,

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "file_id")
  var file: FileEntity? = null,

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  var user: UserEntity? = null
) {
  // Default constructor for Hibernate
  constructor() : this(null, null, "", "", null, null, null)
}
