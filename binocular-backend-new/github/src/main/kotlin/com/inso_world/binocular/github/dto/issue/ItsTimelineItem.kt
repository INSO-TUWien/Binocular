package com.inso_world.binocular.github.dto.issue

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "__typename",
    defaultImpl = ItsClosedEvent::class
)
@JsonSubTypes(
    JsonSubTypes.Type(value = ItsReferencedEvent::class, name = "ReferencedEvent"),
    JsonSubTypes.Type(value = ItsClosedEvent::class, name = "ClosedEvent") // just for completeness
)
sealed class ItsTimelineItem {
    abstract val createdAt: String?
}

@JsonTypeName("ReferencedEvent")
data class ItsReferencedEvent(
    override val createdAt: String?,
    val commit: ItsCommit?
) : ItsTimelineItem()

@JsonTypeName("ClosedEvent")
data class ItsClosedEvent(
    override val createdAt: String?,
    val actor: ItsUser?
) : ItsTimelineItem()
