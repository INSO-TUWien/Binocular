import unprocessedFiles from './files.js';
import commits from './commits';
import commitsFiles from './commits-files.js';

//create dummy data
export const dataset =  {
    nodes: [
        {id: 'files/9002'},
        {id: 'files/1312'},
        {id: 'files/2812'},
        {id: 'files/8306'},
        {id: 'files/3001'},
        {id: 'files/6791'},
        {id: 'files/2381'},
        {id: 'files/699'},
        {id: 'files/2390'},
        {id: 'files/4974'},
        {id: 'files/420'},
        {id: 'files/2011'},
        {id: 'files/1687'},
        {id: 'files/2244'},
        {id: 'files/11547'},
        {id: 'files/4984'},
        {id: 'files/6807'},
        {id: 'files/7136'},
        {id: 'files/7904'},
        {id: 'files/827'},
        {id: 'files/1637'},
        {id: 'files/8369'},
        {id: 'files/7605'},
        {id: 'files/2806'},
        {id: 'files/8713'},
        {id: 'files/7856'},
        {id: 'files/7740'},
        {id: 'files/4146'},
        {id: 'files/4996'},
        {id: 'files/402'},
        {id: 'files/2931'},
        {id: 'files/8413'},
        {id: 'files/8344'},
        {id: 'files/6748'},
        {id: 'files/8430'},
        {id: 'files/1668'},
        {id: 'files/7862'},
        {id: 'files/7842'},
        {id: 'files/2612'},
        {id: 'files/2617'},
        {id: 'files/4923'},
        {id: 'files/7711'},
        {id: 'files/8359'},
        {id: 'files/2367'},
        {id: 'files/395'},
        {id: 'files/692'},
        {id: 'files/2379'},
        {id: 'files/10253'},
        {id: 'files/1032'},
        {id: 'files/8325'},
        {id: 'files/10152'},
        {id: 'files/5211'},
        {id: 'files/1728'},
        {id: 'files/2359'},
        {id: 'files/3282'},
        {id: 'files/7850'},
        {id: 'files/7876'},
        {id: 'files/7634'},
        {id: 'files/8441'},
        {id: 'files/2266'},
        {id: 'files/990'},
        {id: 'files/8703'},
        {id: 'files/4141'},
        {id: 'files/7595'},
        {id: 'files/11555'},
        {id: 'files/2237'},
        {id: 'files/2757'},
        {id: 'files/7884'},
        {id: 'files/1654'},
        {id: 'files/9050'},
        {id: 'files/8354'},
        {id: 'files/424'},
        {id: 'files/4928'},
        {id: 'files/4940'},
        {id: 'files/8447'},
        {id: 'files/478'},
        {id: 'files/5972'},
        {id: 'files/5185'},
        {id: 'files/9200'},
        {id: 'files/1907'},
        {id: 'files/2799'},
        {id: 'files/1683'},
        {id: 'files/2607'},
        {id: 'files/3053'},
        {id: 'files/7896'},
        {id: 'files/2398'},
        {id: 'files/8337'},
        {id: 'files/6766'},
        {id: 'files/7752'},
        {id: 'files/3043'},
        {id: 'files/7674'},
        {id: 'files/6973'},
        {id: 'files/2239'},
        {id: 'files/4964'},
        {id: 'files/6982'},
        {id: 'files/7826'},
        {id: 'files/5204'},
        {id: 'files/7747'},
        {id: 'files/7688'},
        {id: 'files/7761'},
        {id: 'files/1736'},
        {id: 'files/5180'},
        {id: 'files/9048'},
        {id: 'files/9344'},
        {id: 'files/7681'},
        {id: 'files/8311'},
        {id: 'files/3691'},
        {id: 'files/1740'},
        {id: 'files/7578'},
        {id: 'files/2232'},
        {id: 'files/2429'},
        {id: 'files/753'},
        {id: 'files/2407'},
        {id: 'files/2012'},
        {id: 'files/5197'},
        {id: 'files/8708'},
        {id: 'files/6980'},
        {id: 'files/7916'},
        {id: 'files/5190'},
        {id: 'files/697'},
        {id: 'files/2582'},
        {id: 'files/616'},
        {id: 'files/8403'},
        {id: 'files/618'},
        {id: 'files/7733'},
        {id: 'files/7742'},
        {id: 'files/7590'},
        {id: 'files/6975'},
        {id: 'files/612'},
        {id: 'files/7583'},
        {id: 'files/7697'},
        {id: 'files/7766'},
        {id: 'files/9028'},
        {id: 'files/1695'},
        {id: 'files/2431'},
        {id: 'files/10323'},
        {id: 'files/7105'},
        {id: 'files/7872'},
        {id: 'files/7100'},
        {id: 'files/2369'},
        {id: 'files/406'},
        {id: 'files/6107'},
        {id: 'files/508'},
        {id: 'files/7660'},
        {id: 'files/2791'},
        {id: 'files/9041'},
        {id: 'files/8376'},
        {id: 'files/9299'},
        {id: 'files/7735'},
        {id: 'files/1620'},
        {id: 'files/4933'},
        {id: 'files/10148'},
        {id: 'files/8437'},
        {id: 'files/4947'},
        {id: 'files/2619'},
        {id: 'files/5004'},
        {id: 'files/1709'},
        {id: 'files/1704'},
        {id: 'files/1726'},
        {id: 'files/2255'},
        {id: 'files/1023'},
        {id: 'files/3200'},
        {id: 'files/397'},
        {id: 'files/7138'},
        {id: 'files/1732'},
        {id: 'files/7568'},
        {id: 'files/1546'},
        {id: 'files/1666'},
        {id: 'files/4979'},
        {id: 'files/7759'},
        {id: 'files/1209'},
        {id: 'files/8313'},
        {id: 'files/416'},
        {id: 'files/7130'},
        {id: 'files/8318'},
        {id: 'files/2262'},
        {id: 'files/1556'},
        {id: 'files/3546'},
        {id: 'files/11426'}], 
    links: [
    { source: 'files/395', target: 'files/397', sourceColor: 1.0, targetColor: 0.16666666666666666},
    { source: 'files/395', target: 'files/406', sourceColor: 1.0, targetColor: 0.16666666666666666},
    { source: 'files/395', target: 'files/416', sourceColor: 1.0, targetColor: 0.2},
    { source: 'files/395', target: 'files/420', sourceColor: 1.0, targetColor: 0.015151515151515152},
    { source: 'files/395', target: 'files/402', sourceColor: 1.0, targetColor: 0.2},
    { source: 'files/395', target: 'files/424', sourceColor: 1.0, targetColor: 0.021739130434782608},
    { source: 'files/397', target: 'files/406', sourceColor: 0.16666666666666666, targetColor: 0.16666666666666666},
    { source: 'files/397', target: 'files/416', sourceColor: 0.3333333333333333, targetColor: 0.4},
    { source: 'files/397', target: 'files/420', sourceColor: 0.5, targetColor: 0.045454545454545456},
    { source: 'files/397', target: 'files/402', sourceColor: 0.16666666666666666, targetColor: 0.2},
    { source: 'files/397', target: 'files/424', sourceColor: 0.6666666666666666, targetColor: 0.08695652173913043},
    { source: 'files/397', target: 'files/753', sourceColor: 0.5, targetColor: 0.375},
    { source: 'files/397', target: 'files/3200', sourceColor: 0.6666666666666666, targetColor: 1.0},
    { source: 'files/397', target: 'files/1312', sourceColor: 0.5, targetColor: 0.15789473684210525},
    { source: 'files/397', target: 'files/2011', sourceColor: 0.5, targetColor: 0.375},
    { source: 'files/397', target: 'files/2012', sourceColor: 0.5, targetColor: 0.6},
    { source: 'files/397', target: 'files/3282', sourceColor: 0.16666666666666666, targetColor: 0.25},
    { source: 'files/397', target: 'files/508', sourceColor: 0.3333333333333333, targetColor: 0.07692307692307693},
    { source: 'files/397', target: 'files/827', sourceColor: 0.3333333333333333, targetColor: 0.07142857142857142},
    { source: 'files/397', target: 'files/2757', sourceColor: 0.3333333333333333, targetColor: 0.2},
    { source: 'files/397', target: 'files/3546', sourceColor: 0.3333333333333333, targetColor: 0.4},
    { source: 'files/397', target: 'files/1668', sourceColor: 0.3333333333333333, targetColor: 0.2222222222222222},
    { source: 'files/397', target: 'files/3001', sourceColor: 0.3333333333333333, targetColor: 0.25},
    { source: 'files/397', target: 'files/2232', sourceColor: 0.3333333333333333, targetColor: 0.25},
    { source: 'files/397', target: 'files/3691', sourceColor: 0.3333333333333333, targetColor: 0.6666666666666666},
    { source: 'files/397', target: 'files/1546', sourceColor: 0.3333333333333333, targetColor: 0.15384615384615385},
    { source: 'files/397', target: 'files/2359', sourceColor: 0.3333333333333333, targetColor: 0.3333333333333333},
    { source: 'files/397', target: 'files/2931', sourceColor: 0.3333333333333333, targetColor: 0.4},
    { source: 'files/397', target: 'files/2369', sourceColor: 0.3333333333333333, targetColor: 0.3333333333333333},
    { source: 'files/397', target: 'files/2582', sourceColor: 0.3333333333333333, targetColor: 0.13333333333333333},
    { source: 'files/397', target: 'files/2381', sourceColor: 0.3333333333333333, targetColor: 0.6666666666666666},
    { source: 'files/397', target: 'files/2390', sourceColor: 0.3333333333333333, targetColor: 0.15384615384615385},
    { source: 'files/397', target: 'files/2398', sourceColor: 0.3333333333333333, targetColor: 0.6666666666666666},
    { source: 'files/397', target: 'files/2407', sourceColor: 0.3333333333333333, targetColor: 0.4},
    { source: 'files/397', target: 'files/2607', sourceColor: 0.3333333333333333, targetColor: 0.4},
    { source: 'files/397', target: 'files/2612', sourceColor: 0.3333333333333333, targetColor: 0.6666666666666666},
    { source: 'files/397', target: 'files/2617', sourceColor: 0.3333333333333333, targetColor: 0.6666666666666666},
    { source: 'files/397', target: 'files/2791', sourceColor: 0.3333333333333333, targetColor: 0.6666666666666666},
    { source: 'files/397', target: 'files/2799', sourceColor: 0.3333333333333333, targetColor: 0.6666666666666666},
    { source: 'files/397', target: 'files/1683', sourceColor: 0.3333333333333333, targetColor: 0.2857142857142857},
    { source: 'files/397', target: 'files/2619', sourceColor: 0.3333333333333333, targetColor: 0.25},
    { source: 'files/397', target: 'files/1695', sourceColor: 0.3333333333333333, targetColor: 0.4},
    { source: 'files/397', target: 'files/1704', sourceColor: 0.3333333333333333, targetColor: 0.5},
    { source: 'files/397', target: 'files/3043', sourceColor: 0.3333333333333333, targetColor: 0.6666666666666666},
    { source: 'files/397', target: 'files/2429', sourceColor: 0.3333333333333333, targetColor: 0.6666666666666666},
    { source: 'files/397', target: 'files/2431', sourceColor: 0.3333333333333333, targetColor: 0.5},
    { source: 'files/397', target: 'files/3053', sourceColor: 0.3333333333333333, targetColor: 0.6666666666666666},
    { source: 'files/397', target: 'files/1032', sourceColor: 0.3333333333333333, targetColor: 0.09523809523809523},
    { source: 'files/397', target: 'files/1726', sourceColor: 0.3333333333333333, targetColor: 0.5},
    { source: 'files/397', target: 'files/2806', sourceColor: 0.3333333333333333, targetColor: 0.4},
    { source: 'files/397', target: 'files/1728', sourceColor: 0.3333333333333333, targetColor: 0.13333333333333333},
    { source: 'files/397', target: 'files/1740', sourceColor: 0.3333333333333333, targetColor: 0.4},
    { source: 'files/397', target: 'files/2812', sourceColor: 0.3333333333333333, targetColor: 0.25},
    { source: 'files/397', target: 'files/699', sourceColor: 0.3333333333333333, targetColor: 0.06666666666666667},
    { source: 'files/397', target: 'files/478', sourceColor: 0.3333333333333333, targetColor: 0.05},
    { source: 'files/397', target: 'files/2239', sourceColor: 0.16666666666666666, targetColor: 0.25},
    { source: 'files/397', target: 'files/2237', sourceColor: 0.16666666666666666, targetColor: 0.25},
    { source: 'files/397', target: 'files/2244', sourceColor: 0.16666666666666666, targetColor: 0.25},
    { source: 'files/397', target: 'files/2255', sourceColor: 0.16666666666666666, targetColor: 0.25},
    { source: 'files/397', target: 'files/2262', sourceColor: 0.16666666666666666, targetColor: 0.25},
    { source: 'files/397', target: 'files/2266', sourceColor: 0.16666666666666666, targetColor: 0.25},
    { source: 'files/397', target: 'files/1209', sourceColor: 0.16666666666666666, targetColor: 0.1111111111111111},
    { source: 'files/397', target: 'files/4141', sourceColor: 0.16666666666666666, targetColor: 0.047619047619047616},
    { source: 'files/397', target: 'files/4146', sourceColor: 0.16666666666666666, targetColor: 0.058823529411764705},
    { source: 'files/397', target: 'files/618', sourceColor: 0.16666666666666666, targetColor: 0.1},
    { source: 'files/397', target: 'files/7105', sourceColor: 0.16666666666666666, targetColor: 0.25},
    { source: 'files/397', target: 'files/7100', sourceColor: 0.16666666666666666, targetColor: 1.0},
    { source: 'files/397', target: 'files/7130', sourceColor: 0.16666666666666666, targetColor: 1.0},
    { source: 'files/397', target: 'files/616', sourceColor: 0.16666666666666666, targetColor: 0.5},
    { source: 'files/397', target: 'files/7136', sourceColor: 0.16666666666666666, targetColor: 0.5},
    { source: 'files/397', target: 'files/7138', sourceColor: 0.16666666666666666, targetColor: 1.0},
    { source: 'files/397', target: 'files/1736', sourceColor: 0.16666666666666666, targetColor: 0.5},
    { source: 'files/406', target: 'files/416', sourceColor: 0.16666666666666666, targetColor: 0.2},
    { source: 'files/406', target: 'files/420', sourceColor: 0.8333333333333334, targetColor: 0.07575757575757576},
    { source: 'files/406', target: 'files/402', sourceColor: 0.16666666666666666, targetColor: 0.2},
    { source: 'files/406', target: 'files/424', sourceColor: 0.5, targetColor: 0.06521739130434782},
    { source: 'files/406', target: 'files/692', sourceColor: 0.16666666666666666, targetColor: 0.3333333333333333},
    { source: 'files/406', target: 'files/699', sourceColor: 0.3333333333333333, targetColor: 0.06666666666666667},
    { source: 'files/406', target: 'files/697', sourceColor: 0.16666666666666666, targetColor: 0.3333333333333333},
    { source: 'files/406', target: 'files/478', sourceColor: 0.6666666666666666, targetColor: 0.1},
    { source: 'files/406', target: 'files/508', sourceColor: 0.3333333333333333, targetColor: 0.07692307692307693},
    { source: 'files/406', target: 'files/753', sourceColor: 0.5, targetColor: 0.375},
    { source: 'files/406', target: 'files/612', sourceColor: 0.3333333333333333, targetColor: 0.6666666666666666},
    { source: 'files/406', target: 'files/827', sourceColor: 0.3333333333333333, targetColor: 0.07142857142857142},
    { source: 'files/406', target: 'files/618', sourceColor: 0.3333333333333333, targetColor: 0.2},
    { source: 'files/406', target: 'files/1620', sourceColor: 0.16666666666666666, targetColor: 1.0},
    { source: 'files/406', target: 'files/1637', sourceColor: 0.16666666666666666, targetColor: 0.5},
    { source: 'files/406', target: 'files/1654', sourceColor: 0.16666666666666666, targetColor: 0.5},
    { source: 'files/406', target: 'files/1666', sourceColor: 0.16666666666666666, targetColor: 0.3333333333333333},
    { source: 'files/406', target: 'files/1668', sourceColor: 0.16666666666666666, targetColor: 0.1111111111111111},
    { source: 'files/406', target: 'files/1546', sourceColor: 0.16666666666666666, targetColor: 0.07692307692307693},
    { source: 'files/406', target: 'files/1556', sourceColor: 0.16666666666666666, targetColor: 0.5},
    { source: 'files/406', target: 'files/1683', sourceColor: 0.16666666666666666, targetColor: 0.14285714285714285},
    { source: 'files/406', target: 'files/1687', sourceColor: 0.16666666666666666, targetColor: 1.0},
    { source: 'files/406', target: 'files/1695', sourceColor: 0.16666666666666666, targetColor: 0.2},
    { source: 'files/406', target: 'files/1704', sourceColor: 0.16666666666666666, targetColor: 0.25},
    { source: 'files/406', target: 'files/1709', sourceColor: 0.16666666666666666, targetColor: 0.3333333333333333},
    { source: 'files/406', target: 'files/1032', sourceColor: 0.16666666666666666, targetColor: 0.047619047619047616},
    { source: 'files/406', target: 'files/1726', sourceColor: 0.16666666666666666, targetColor: 0.25},
    { source: 'files/406', target: 'files/1728', sourceColor: 0.16666666666666666, targetColor: 0.06666666666666667},
    { source: 'files/406', target: 'files/1732', sourceColor: 0.16666666666666666, targetColor: 1.0},
    { source: 'files/406', target: 'files/1736', sourceColor: 0.16666666666666666, targetColor: 0.5},
    { source: 'files/406', target: 'files/1740', sourceColor: 0.16666666666666666, targetColor: 0.2},
    { source: 'files/416', target: 'files/420', sourceColor: 0.6, targetColor: 0.045454545454545456},
    { source: 'files/416', target: 'files/402', sourceColor: 0.2, targetColor: 0.2},
    { source: 'files/416', target: 'files/424', sourceColor: 0.8, targetColor: 0.08695652173913043},
    { source: 'files/416', target: 'files/4141', sourceColor: 0.6, targetColor: 0.14285714285714285},
    { source: 'files/416', target: 'files/827', sourceColor: 0.6, targetColor: 0.10714285714285714},
    { source: 'files/416', target: 'files/508', sourceColor: 0.4, targetColor: 0.07692307692307693},
    { source: 'files/416', target: 'files/1312', sourceColor: 0.4, targetColor: 0.10526315789473684},
    { source: 'files/416', target: 'files/1907', sourceColor: 0.4, targetColor: 0.2857142857142857},
    { source: 'files/416', target: 'files/4146', sourceColor: 0.4, targetColor: 0.11764705882352941},
    { source: 'files/416', target: 'files/5180', sourceColor: 0.4, targetColor: 0.16666666666666666},
    { source: 'files/416', target: 'files/5185', sourceColor: 0.4, targetColor: 0.2857142857142857},
    { source: 'files/416', target: 'files/5190', sourceColor: 0.4, targetColor: 0.4},
    { source: 'files/416', target: 'files/5197', sourceColor: 0.4, targetColor: 0.4},
    { source: 'files/416', target: 'files/5204', sourceColor: 0.4, targetColor: 0.4},
    { source: 'files/416', target: 'files/5211', sourceColor: 0.4, targetColor: 0.18181818181818182},
    { source: 'files/416', target: 'files/2582', sourceColor: 0.4, targetColor: 0.13333333333333333},
    { source: 'files/416', target: 'files/2390', sourceColor: 0.4, targetColor: 0.15384615384615385},
    { source: 'files/416', target: 'files/1032', sourceColor: 0.4, targetColor: 0.09523809523809523},
    { source: 'files/416', target: 'files/1728', sourceColor: 0.4, targetColor: 0.13333333333333333},
    { source: 'files/416', target: 'files/478', sourceColor: 0.4, targetColor: 0.05},
    { source: 'files/416', target: 'files/1668', sourceColor: 0.2, targetColor: 0.1111111111111111},
    { source: 'files/416', target: 'files/2232', sourceColor: 0.2, targetColor: 0.125},
    { source: 'files/416', target: 'files/1546', sourceColor: 0.2, targetColor: 0.07692307692307693},
    { source: 'files/416', target: 'files/2237', sourceColor: 0.2, targetColor: 0.25},
    { source: 'files/416', target: 'files/2239', sourceColor: 0.2, targetColor: 0.25},
    { source: 'files/416', target: 'files/2244', sourceColor: 0.2, targetColor: 0.25},
    { source: 'files/416', target: 'files/2255', sourceColor: 0.2, targetColor: 0.25},
    { source: 'files/416', target: 'files/2262', sourceColor: 0.2, targetColor: 0.25},
    { source: 'files/416', target: 'files/2266', sourceColor: 0.2, targetColor: 0.25},
    { source: 'files/416', target: 'files/4928', sourceColor: 0.2, targetColor: 0.3333333333333333},
    { source: 'files/416', target: 'files/4923', sourceColor: 0.2, targetColor: 0.3333333333333333},
    { source: 'files/416', target: 'files/4940', sourceColor: 0.2, targetColor: 0.3333333333333333},
    { source: 'files/416', target: 'files/4933', sourceColor: 0.2, targetColor: 0.3333333333333333},
    { source: 'files/416', target: 'files/4947', sourceColor: 0.2, targetColor: 0.3333333333333333},
    { source: 'files/416', target: 'files/2619', sourceColor: 0.2, targetColor: 0.125},
    { source: 'files/416', target: 'files/4974', sourceColor: 0.2, targetColor: 0.14285714285714285},
    { source: 'files/416', target: 'files/4964', sourceColor: 0.2, targetColor: 0.25},
    { source: 'files/416', target: 'files/4984', sourceColor: 0.2, targetColor: 0.3333333333333333},
    { source: 'files/416', target: 'files/4979', sourceColor: 0.2, targetColor: 0.3333333333333333},
    { source: 'files/416', target: 'files/4996', sourceColor: 0.2, targetColor: 0.3333333333333333},
    { source: 'files/416', target: 'files/5004', sourceColor: 0.2, targetColor: 0.25},
    ]
};

export function generateLinkIndices(dataset){
    dataset.links.forEach(element => {
        let sourceIndex = dataset.nodes.findIndex(_ => _.id === element.source);
        let targetIndex = dataset.nodes.findIndex(_ => _.id === element.target);
        if(sourceIndex === undefined || sourceIndex === -1) sourceIndex = 0;
        if(targetIndex === undefined || targetIndex === -1) targetIndex = 0;
  
        element['source'] = sourceIndex;
        element['target'] = targetIndex;
    });

    unprocessedFiles.forEach(file => {
        let fileName = file.path.split("/");
        fileName = fileName[fileName.length - 1];
        file.name = fileName;
    });

    dataset.nodes.forEach(node => {
        const file = unprocessedFiles.find(_ => _.id == node.id)
        if(file != undefined) node.id = file.name;
    })
  }



// Functions to generate dataset from real data
export function generateDataset(){
    const files = unprocessedFiles;

    files.forEach(file => {
        let fileName = file.path.split("/");
        fileName = fileName[fileName.length - 1];
        file.name = fileName;
    });

    let counterArrays = initializeFileArrays();
    let commitCountForFile = counterArrays.commitCountForFile;
    let commitCountForCoChangedFiles = counterArrays.commitCountForCoChangedFiles;

    commits.forEach(commit => {
        // get all files touched by one commit
        const matchingCommitFiles = commitsFiles.filter(_ => _.to === commit.id)
        
        // update the files stats
        matchingCommitFiles.forEach(commitFile => {
            commitCountForFile[commitFile.from] += 1;

            // update co-change counter from file a to file b
            matchingCommitFiles.forEach(adjacentCommitFile => {
                commitCountForCoChangedFiles[commitFile.from][adjacentCommitFile.from] += 1;
            })
        })
    })
}


function initializeFileArrays(){
    let commitCountForFile = [];
    let commitCountForCoChangedFiles = [];
    
    unprocessedFiles.forEach(file => {
        commitCountForFile[file.id] = 0;
        commitCountForCoChangedFiles[file.id] = [];

        // Initialize all relationships
        unprocessedFiles.forEach(adjacentFile => {
            commitCountForCoChangedFiles[file.id][adjacentFile.id] = 0;
        });
    });

    let fileArrays = {
        commitCountForFile: commitCountForFile,
        commitCountForCoChangedFiles: commitCountForCoChangedFiles
    }

    return fileArrays;
}


