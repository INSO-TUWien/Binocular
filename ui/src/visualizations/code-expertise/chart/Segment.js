import * as d3 from "d3"
import chroma from 'chroma-js';
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { setDetails } from '../sagas'


function Segment( { rad, startPercent, endPercent, devName, devData, maxCommits, devColor } ) {

    const dispatch = useDispatch()

    const detailsDev = useSelector((state) => state.visualizations.codeExpertise.state.config.details)

    const [radius, setRadius] = useState(rad)
    const [focus, setFocus] = useState(false)
    
    const focusSegment = () => {
        setFocus(true)        
        setRadius(rad*1.2)
    }

    const unfocusSegment = () => {
        setFocus(false)
        setRadius(rad)
    }
    

    //enlarge segment and show additional information in the chart if mouse hovers over segment
    const mouseEnter = () => {
        focusSegment()
    }

    //only decrease size if segment is not selected (has not been clicked on to show details in the side panel)
    const mouseLeave = () => {
        if(!(detailsDev === devName)) {
            unfocusSegment()
        }
    }

    const onClickSegment = () => {
        dispatch(setDetails(devName))
    }

    useEffect(() => {
        if(detailsDev === devName) {
            focusSegment()
        } else {
            unfocusSegment()
        }
    }, [detailsDev, devName])


    //update radius state when rad prop changes
    useEffect(() => {
        if(detailsDev === devName) {
            focusSegment()
        } else {
            unfocusSegment()
        }
    }, [rad])

    // ######################## COLORS ########################

    const devColorLight = devColor
    const devColorDark = chroma(devColor).darken().hex()
    const goodCommitsColor = chroma('green').brighten().hex()
    const badCommitsColor = chroma('red').brighten().hex()
    

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


    // ######################## BUILD ARCS ########################

    //goot commits are shown in an arc outside the circle segment, bad commits inside.
    //this sets the bounds for this section of the chart
    const buildWeight = radius * 0.25

    const goodCommits = devData.commits.filter(c => c.build == 'success').length
    const badCommits = devData.commits.filter(c => c.build != null && c.build != 'success').length

    let goodCommitsRadius = radius
    //prevent /0
    if(maxCommits > 0) {
        goodCommitsRadius = radius + (buildWeight * (goodCommits / maxCommits))
    }
    
    const goodCommitsArc = d3.arc()
    goodCommitsArc
        .innerRadius(radius)
        .outerRadius(goodCommitsRadius)
        .startAngle(arcStartAngle)
        .endAngle(arcEndAngle)
    
    
    let badCommitsRadius = radius
    //prevent /0
    if (maxCommits > 0) {
        badCommitsRadius = radius - (buildWeight * (badCommits / maxCommits))
    }
    
    const badCommitsArc = d3.arc()
    badCommitsArc
        .innerRadius(badCommitsRadius)
        .outerRadius(radius)
        .startAngle(arcStartAngle)
        .endAngle(arcEndAngle)


    // ######################## RED ARC ########################

    const additionsArcWeight = radius / 20
    const additionsArcInnerRadius = radius * 0.6 - additionsArcWeight
    const additionsArcOuterRadius = radius * 0.6 + additionsArcWeight
    const additionsArc = d3.arc()
    additionsArc
        .innerRadius(additionsArcInnerRadius)
        .outerRadius(additionsArcOuterRadius)
        .startAngle(arcStartAngle)
        .endAngle(arcEndAngle)


    // ######################## GREEN OWNERSHIP ARC ########################

    let ownershipEndAngle = arcStartAngle
    if(devData.linesOwned) {
        ownershipEndAngle += getAngle((endPercent - startPercent) * (devData.linesOwned / devData.additions))
        if(ownershipEndAngle > arcEndAngle) {
            ownershipEndAngle = arcEndAngle
        }
    }
    const ownershipArc = d3.arc()
    ownershipArc
        .innerRadius(additionsArcInnerRadius)
        .outerRadius(additionsArcOuterRadius)
        .startAngle(arcStartAngle)
        .endAngle(ownershipEndAngle)

    
    // ######################## GENERAL TEXT SETTINGS ########################

    //the text will eventually land on the angle halfway between startAngle and endAngle.
    const middleAngle = getAngle(startPercent + ((endPercent - startPercent) / 2))

    //decide which direction the path will be (from startAngle to endAngle or vice versa).
    //this affects  if the text is upside down or not
    //if middleAngle is < 180° (PI), reverse text (because then we are at the lower half of the diagram)
    let reverseText = false
    if(middleAngle < Math.PI) {
        reverseText = true
    }

    //at which radius should the dev name be placed
    const devNameRadius = radius * 1.31


    // ######################## ADDITIONS TEXT ########################

    const additionsTextArcRadius = additionsArcOuterRadius + additionsArcWeight
    const additionsTextArc = d3.arc()
    additionsTextArc
        .innerRadius(additionsTextArcRadius)
        .outerRadius(additionsTextArcRadius)
        .startAngle(reverseText ? arcEndAngle : arcStartAngle)
        .endAngle(reverseText ? arcStartAngle : arcEndAngle)


    // ######################## DEV NAME OUTSIDE OF SEGMENT ########################

    //if the segment is small, the text probably wont fit in an arc at the outer border.
    //in this case, write the text besides the segment
    let smallSegment = false
    if((arcEndAngle - arcStartAngle) < (Math.PI / 4)) {
        smallSegment = true
    }

    //if text is at the right side of the diagram, the textanchor should be start, otherwise end
    //(so that the text does not overlap with the diagram)
    let textAnchorStart = false
    if((middleAngle < (Math.PI/2)) || (middleAngle > (Math.PI*1.5))) {
        textAnchorStart = true
    }

    //in case segment is small, get the coordinates for the point in between startP end endP, just outside the segment.
    //used as anchor point for the text
    const nameCoord = getCoordinatesForPercent((devNameRadius), middleAngle)

    //in case segment is large enought for the text to be in an arc
    const displayName = devName.split(" <")[0]
    const nameArc = d3.arc()
    nameArc
        .innerRadius(devNameRadius)
        .outerRadius(devNameRadius)
        .startAngle(reverseText ? arcEndAngle : arcStartAngle)
        .endAngle(reverseText ? arcStartAngle : arcEndAngle)

    

    return (
        <g
        onMouseEnter={mouseEnter}
        onMouseLeave={mouseLeave}
        onClick={onClickSegment}>

            <defs>
                <pattern id={`hatch_${devName.replace(/\s/g, '')}`} patternUnits='userSpaceOnUse' width='4' height='4'>
                <path d='M-1,1 l2,-2
                        M0,4 l4,-4
                        M3,5 l2,-2' 
                        style={{stroke: devColorDark, strokeWidth: 1}} />
                </pattern>
            </defs>
            



            {/*outer border*/}  
            <path
            d={circleSegment.toString()}
            stroke="black"
            fill="white"
            />

            {/*red arc*/}
            <path
            d={additionsArc().toString()}
            fill={`url(#hatch_${devName.replace(/\s/g, '')})`}
            />

            {/*ownership arc*/}
            <path
            d={ownershipArc().toString()}
            fill={devColorDark}
            />

            {/*additions number outside additions/ownership arc. Only display this when mouse hovers on segment*/}
            {focus &&
            <g>
                <defs>
                    <path
                    id = {devName.replace(/\s/g, '') + "_additionsPath"}
                    d={additionsTextArc().toString()}
                    />
                </defs>
                <text>
                    <textPath
                    href={"#" + devName.replace(/\s/g, '') + "_additionsPath"}
                    startOffset="25%"
                    textAnchor="middle"
                    alignmentBaseline="middle">
                        {devData.linesOwned ? devData.linesOwned : '0'}/{devData.additions ? devData.additions : '0'}
                    </textPath>
                </text>
            </g>
            }

            {/*bad commits arc*/}
            <path
            d={badCommitsArc().toString()}
            fill={badCommitsColor}
            />

            {/*good commits arc*/}
            <path
            d={goodCommitsArc().toString()}
            fill={goodCommitsColor}
            />

            {/*dev name outside of segment*/}
            {!smallSegment &&
                <g>
                    <defs>
                        <path
                        id = {devName.replace(/\s/g, '') + "_namePath"}
                        d={nameArc().toString()}
                        />
                    </defs>
                    <text>
                        <textPath
                        href={"#" + devName.replace(/\s/g, '') + "_namePath"}
                        startOffset="25%"
                        textAnchor="middle"
                        alignmentBaseline="middle">
                            {displayName}
                        </textPath>
                    </text>
                </g>
            }

            {smallSegment &&
                <text
                x={nameCoord[0]}
                y={nameCoord[1]}
                textAnchor={textAnchorStart ? "start" : "end"}
                alignment-baseline="middle">
                    {displayName}
                </text>
            }

            {/*outer border without fill, just for contours*/}  
            <path
            d={circleSegment.toString()}
            stroke="black"
            fill="none"
            />
            
        </g>
    )
}

//given a circle at (0,0) and specified radius, get the coordinates of a point on the outside line for the specified angle
function getCoordinatesForPercent(radius, angle) {
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)
    return [x,y]
}

function getAngle(percent) {
    return (2 * Math.PI * percent)
}

export default Segment