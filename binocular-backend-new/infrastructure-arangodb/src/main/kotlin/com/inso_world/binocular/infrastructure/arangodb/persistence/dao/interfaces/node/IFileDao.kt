package com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node

import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.IDao
import com.inso_world.binocular.model.File

internal interface IFileDao : IDao<File, String> {
    fun findByPath(path: String): File?
}
