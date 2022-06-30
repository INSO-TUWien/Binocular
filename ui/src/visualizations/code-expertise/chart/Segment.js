import * as d3 from "d3"
import React, { useState } from "react";

function Segment( { rad, startPercent, endPercent, devName, devData } ) {

    const [radius, setRadius] = useState(rad)
    const [focus, setFocus] = useState(false)

    const mouseEnter = () => {
        setFocus(true)        
        setRadius(rad*1.2)
    }

    const mouseLeave = () => {
        setFocus(false)
        setRadius(rad)
    }


    // ######################## OUTER BORDER ########################

    //path for the outer boarder of the segment
    const circleSegment = d3.path()
    circleSegment.moveTo(0,0)
    circleSegment.arc(0,0,radius,getAngle(startPercent), getAngle(endPercent))
    circleSegment.closePath()


    // ######################## ARCS SETTINGS GENERAL ########################

    //for some reason, arc() starts at another point that path().arc(),
    // so we have to offset the startAngle and endAngle by PI/2
    const offset = Math.PI/2
    const arcStartAngle = getAngle(startPercent) + offset
    const arcEndAngle = getAngle(endPercent) + offset


    // ######################## GREEN ADDITIONS ARC ########################

    const additionsArcWeight = radius / 20
    const additionsArcInnerRadius = radius * 0.6 - additionsArcWeight
    const additionsArcOuterRadius = radius * 0.6 + additionsArcWeight
    const additionsArc = d3.arc()
    additionsArc
        .innerRadius(additionsArcInnerRadius)
        .outerRadius(additionsArcOuterRadius)
        .startAngle(arcStartAngle)
        .endAngle(arcEndAngle)

    
    // ######################## GENERAL TEXT SETTINGS ########################

    //decide which direction the path will be (from startAngle to endAngle or vice versa).
    //this affects  if the text is upside down or not
    //the text will eventually land on the angle halfway between startAngle and endAngle.
    //-> if this angle is < 180° (or PI), reverse text (because then we are at the lower half of the diagram)
    let reverseText = false
    const middleAngle = getAngle(startPercent + ((endPercent - startPercent) / 2))
    if(middleAngle < Math.PI) {
        reverseText = true
    }


    // ######################## ADDITIONS TEXT ########################

    const additionsTextArcRadius = additionsArcOuterRadius + additionsArcWeight
    const additionsTextArc = d3.arc()
    additionsTextArc
        .innerRadius(additionsTextArcRadius)
        .outerRadius(additionsTextArcRadius)
        .startAngle(reverseText ? arcEndAngle : arcStartAngle)
        .endAngle(reverseText ? arcStartAngle : arcEndAngle)


    // ######################## DEV NAME OUTSIDE OF SEGMENT ########################

    const displayName = devName.split(" <")[0]
    const nameArcRadius = radius * 1.1
    const nameArc = d3.arc()
    nameArc
        .innerRadius(nameArcRadius)
        .outerRadius(nameArcRadius)
        .startAngle(reverseText ? arcEndAngle : arcStartAngle)
        .endAngle(reverseText ? arcStartAngle : arcEndAngle)

    

    return (
        
        <g
        onMouseEnter={mouseEnter}
        onMouseLeave={mouseLeave}>
            {/*outer border*/}  
            <path
            d={circleSegment.toString()}
            stroke="black"
            fill="white"
            />

            {/*green additions arc*/}
            <path
            d={additionsArc().toString()}
            fill="green"
            />

            {/*additions number outside green additions arc. Only display this when mouse hovers on segment*/}
            {focus &&
            <g>
                <defs>
                    <path
                    id = {devName + "_additionsPath"}
                    d={additionsTextArc().toString()}
                    />
                </defs>
                <text>
                    <textPath
                    href={"#" + devName + "_additionsPath"}
                    startOffset="25%"
                    textAnchor="middle"
                    alignmentBaseline="middle">
                        {devData.additions}
                    </textPath>
                </text>
            </g>
            }

            {/*dev name outside of segment*/}
            <defs>
                <path
                id = {devName + "_namePath"}
                d={nameArc().toString()}
                />
            </defs>
            <text>
                <textPath
                href={"#" + devName + "_namePath"}
                startOffset="25%"
                textAnchor="middle"
                alignmentBaseline="middle">
                    {displayName}
                </textPath>
            </text>
            
        </g>

        
        
    )

}

function getCoordinatesForPercent(radius, percent) {
    const x = radius * Math.cos(2 * Math.PI * percent)
    const y = radius * Math.sin(2 * Math.PI * percent)
    return [x,y]
}

function getAngle(percent) {
    return (2 * Math.PI * percent)
}

export default Segment