package com.inso_world.binocular.infrastructure.arangodb

import com.inso_world.binocular.infrastructure.arangodb.service.AbstractInfrastructurePort
import org.springframework.transaction.annotation.Transactional
import java.io.Serializable

@Transactional
internal fun <T : Any, I : Serializable> AbstractInfrastructurePort<T, I>.deleteAllEntities() {
    this.dao.deleteAll()
}
