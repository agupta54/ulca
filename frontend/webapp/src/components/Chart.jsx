import React, { useEffect, useState } from "react";
import { withStyles, Typography, Paper, Button,TextField } from "@material-ui/core";
import ChartStyles from "../styles/Dashboard";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, LabelList, YAxis, Tooltip } from 'recharts';
import FetchLanguageDataSets from "../actions/FetchLanguageDataSets";
import { ArrowBack } from '@material-ui/icons';
import {DatasetItems,Language} from "../configs/DatasetItems";
import TitleBar from "./TitleBar";
import Autocomplete from '@material-ui/lab/Autocomplete';
import image from "../img/shape2.svg"
var colors = ["188efc", "7a47a4", "b93e94", "1fc6a4", "f46154", "d088fd", "f3447d", "188efc", "f48734", "189ac9", "0e67bd"]


const ChartRender = (props) => {
	const [selectedOption, setSelectedOption] = useState(DatasetItems[0]);
	const [count, setCount] = useState(0);
	const [total, setTotal] = useState(0);
	const [toggleValue, setToggleValue] = useState("domains");
	const [axisValue, setAxisValue] = useState({yAxis:"Count", xAxis:"Languages"});
	const [title, setTitle] = useState("Number of parallel sentences per language with");
	const [filterValue, setFilterValue] = useState("domains");
  const [data, setData] = useState([]);
  const [dataValue, setDataValue] = useState("");
	const [selectedLanguage, setSelectedLanguage] = useState("");
	const [selectedLanguageName, setSelectedLanguageName] = useState("");
	const [page, setPage] = useState(0);
	const [sourceLanguage, setSourceLanguage] = useState(
        { value: 'en', label: 'English' }
    );

  useEffect(() => {
    fetchChartData(selectedOption.value,"", [{"field": "sourceLanguage","value": sourceLanguage.value}])
      
  }, [selectedOption,sourceLanguage]);

	const { classes } = props;
	const options = DatasetItems;
	

  const fetchChartData = async (dataType, value, criterions) => {
    let apiObj = new FetchLanguageDataSets(dataType, value, criterions);
        fetch(apiObj.apiEndPoint(), {
          method: 'post',
          body: JSON.stringify(apiObj.getBody()),
          headers: apiObj.getHeaders().headers
        }).then(async response => {
          const rsp_data = await response.json();
          if (!response.ok) {
            return Promise.reject('');
          } else {
            let res = rsp_data.data.sort((a,b)=>b.value-a.value)
            setData(res)
			let total = rsp_data.data.reduce((acc,rem)=> acc= acc+Number(rem.value),0)
			setCount(total%1===0 ? total : total.toFixed(3))
			setTotal(rsp_data.count)
          }
        }).catch((error) => { 
        }); 
    }

	const handleLanguagePairChange = (value, property) => {
		let sLang =  Language.filter(val => val.label ===value )[0]
		if(sLang){
		// fetchChartData(selectedOption.value, "", [{"field": "sourceLanguage","value":  sLang.value}])
        setSourceLanguage(sLang);
		}


    };

	const renderTexfield = (id, label, value, options, filter) => {
        let labels = Language.map(lang => lang.label)
        return (
            <Autocomplete
				className={classes.titleDropdown}
				
                value={sourceLanguage.label}
                id="source"
                options={labels}
                onChange={(event, data) => handleLanguagePairChange(data, 'source')}
                renderInput={(params) => <TextField fullWidth {...params}  variant="standard"
                    // error={srcError}
                    // helperText={srcError && "This field is mandatory"}
                />}
            />


        )
    }
	const handleLevelChange = (value) =>{
		setToggleValue(value)
		// setTitle(`English-${selectedLanguageName}  ${selectedOption.value}- Grouped by ${(value === "domains") ? "Domain" : (value === "source") ? "Source" : value === "collectionMethod_collectionDescriptions" ? "Collection Method" : "Domain"}`)
		handleOnClick(2, "", value)
	}
	

	const fetchParams = (event) => {
		var source = ""
		let targetLanguage = ""
		if (selectedOption.value === "parallel-corpus") {
			source =sourceLanguage.value ;
			targetLanguage =   (selectedLanguage ? selectedLanguage : event && event.hasOwnProperty("_id") && event._id) 
		}
		else {
			source = (selectedLanguage ? selectedLanguage : event && event.hasOwnProperty("_id") && event._id);
			targetLanguage =  "" ;

		}
		setSelectedLanguage(selectedLanguage ? selectedLanguage : event && event.hasOwnProperty("_id") && event._id)
		setSelectedLanguageName(selectedLanguageName ? selectedLanguageName : event && event.hasOwnProperty("label") && event.label)
		return ([{ "field":"sourceLanguage", "value": source,},{ "field":"targetLanguage", "value": targetLanguage }])
	}

	const fetchNextParams = (eventValue) => {
		var source = ""
		let targetLanguage = ""
		let val = eventValue && eventValue.hasOwnProperty("_id") && eventValue._id
		let event = { "field": filterValue, "value": val ? val : dataValue }
		val && setDataValue(val)
		if (selectedOption.value === "parallel-corpus") {
			source = sourceLanguage.value
			targetLanguage =  selectedLanguage 

		}
		else {
			source = selectedLanguage ;
			targetLanguage = "";

		}
		setSelectedLanguage(selectedLanguage ? selectedLanguage : event && event.hasOwnProperty("_id") && event._id)
		setSelectedLanguageName(selectedLanguageName ? selectedLanguageName : event && event.hasOwnProperty("label") && event.label)
		return ([{ "field":"sourceLanguage", "value": source,},{ "field":"targetLanguage", "value": targetLanguage }, event])
	}

	const handleOnClick = (value, event, filter) => {
		switch (value) {
			case 1:
				fetchChartData(selectedOption.value, filter ? filter : filterValue, fetchParams(event))
				setFilterValue(filter ? filter : filterValue)
				handleSelectChange(selectedOption, event, filter, value)
				setPage(value)

				break;
			case 2:
				let fValue = filter?filter:filterValue === "collectionMethod_collectionDescriptions" ? "domains" : "collectionMethod_collectionDescriptions";
				fetchChartData(selectedOption.value,fValue , fetchNextParams(event))
				setPage(value)
				
				setToggleValue(fValue)
				handleSelectChange(selectedOption, event, fValue, value)

				break;
			case 0:
				fetchChartData(selectedOption.value, "", [{"field": "sourceLanguage","value": sourceLanguage.value}])
				setPage(value)
				setFilterValue('domains')
				handleSelectChange(selectedOption, "", "", value)
				setSelectedLanguage("")
				setSelectedLanguageName("")
				break;
			default:

		}

	}
	const handleLanguageChange = (value) => {
		setFilterValue(value)
		setTitle(`English-${selectedLanguageName}  ${selectedOption.value}- Grouped by ${(value === "domains") ? "Domain" : (value === "source") ? "Source" : value === "collectionMethod_collectionDescriptions" ? "Collection Method" : "Domain"}`)
		handleOnClick(1, "", value)
	}
	const handleCardNavigation = () => {

		handleOnClick(page - 1)
	}



	const fetchFilterButtons = () => {
		return (
			<div className={classes.filterButton}>
				<Typography className={classes.fiterText} value="" variant="body1"> Filter By </Typography>
				<Button color={filterValue === "domains" ? "primary" : "default"}  size="small" variant="outlined" className={classes.backButton} onClick={() => handleLanguageChange("domains")}>Domain</Button>
				{/* <Button  color={filterValue === "source" ? "primary":"default"} style={ filterValue === "source" ? {backgroundColor: "#E8F5F8"} : {} }size="medium" variant="outlined" className={classes.backButton} onClick={() => handleLanguageChange("source")}>Source</Button> */}
				<Button style={{marginRight:"10px"}} color={filterValue === "collectionMethod_collectionDescriptions" ? "primary" : "default"}  size="small" variant="outlined" onClick={() => handleLanguageChange("collectionMethod_collectionDescriptions")}>Collection Method</Button>
				<Button color={filterValue === "primarySubmitterName" ? "primary" : "default"}  size="small" variant="outlined" onClick={() => handleLanguageChange("primarySubmitterName")}>Submitter</Button>

			</div>
		)
	}

	const fetchButtonssecondLevel = () => {
		debugger
		return (
			<div className={classes.filterButton}>
				<Typography className={classes.fiterText} value="" variant="body1"> Filter By </Typography>
				{filterValue !== "domains" &&<Button color={toggleValue === "domains" ? "primary" : "default"}  size="small" variant="outlined" className={classes.backButton} onClick={() => handleLevelChange("domains")}>Domain</Button>}
				{/* <Button  color={filterValue === "source" ? "primary":"default"} style={ filterValue === "source" ? {backgroundColor: "#E8F5F8"} : {} }size="medium" variant="outlined" className={classes.backButton} onClick={() => handleLanguageChange("source")}>Source</Button> */}
				{filterValue !== "collectionMethod_collectionDescriptions" &&<Button style={{marginRight:"10px"}} color={toggleValue === "collectionMethod_collectionDescriptions" ? "primary" : "default"}  size="small" variant="outlined" onClick={() => handleLevelChange("collectionMethod_collectionDescriptions")}>Collection Method</Button>}
				{filterValue !== "primarySubmitterName" &&<Button color={toggleValue === "primarySubmitterName" ? "primary" : "default"}  size="small" variant="outlined" onClick={() => handleLevelChange("primarySubmitterName")}>Submitter</Button>}

			</div>
		)
	}

	const handleSelectChange = (dataSet, event, filter, page) => {
		setSelectedOption(dataSet)
		switch (dataSet.value) {
			case 'parallel-corpus':
				if (page === 0) {
					setTitle("Number of parallel sentences per language with ")
					selectedOption.value !== dataSet.value && fetchChartData(dataSet.value, "", [{"field": "sourceLanguage","value": sourceLanguage.value}])
					setAxisValue({xAxis:"Languages",yAxis:"Count"})
					

				} else if (page === 1) {
					setTitle(`${sourceLanguage.label}-${selectedLanguageName ? selectedLanguageName : event && event.hasOwnProperty("label") && event.label}  parallel sentences - Grouped by ${(filter === "domains") ? "Domain" : (filter === "source") ? "Source" : filter === "collectionMethod_collectionDescriptions" ? "Collection Method" : filter === "primarySubmitterName" ? "Submitter":"Domain"}`)
					setAxisValue({yAxis:("Count"),xAxis:(filter === "domains") ? "Domain" : (filter === "source") ? "Source" : filter === "collectionMethod_collectionDescriptions" ? "Collection Method" : filter === "primarySubmitterName" ? "Submitter": "Domain"})
					

				} else if (page === 2) {
					setTitle(`${sourceLanguage.label}-${selectedLanguageName} parallel sentences ${filterValue === "primarySubmitterName"? "by" :"of"}  ${event.label?event.label : dataValue } - Grouped by ${(filter === "domains") ? "Domain" :  filter === "collectionMethod_collectionDescriptions" ? "Collection Method":filter === "primarySubmitterName" ? "Submitter" : "Domain"}`)
					setAxisValue({yAxis:("Count"),xAxis:(filter === "domains") ? "Domain" :  filter === "collectionMethod_collectionDescriptions" ? "Collection Method": filter === "primarySubmitterName" ? "Submitter": "Domain"})
					
					
				}

				break;
			case 'monolingual-corpus':
				if (page === 0) {
					selectedOption.value !== dataSet.value && fetchChartData(dataSet.value, "", [{"field": "sourceLanguage","value": null}])
					setTitle('Number of sentences per language')
					
					setAxisValue({xAxis:"Languages",yAxis:"Count"})
					
				} else if (page === 1) {
					setTitle(`Number of sentences in ${selectedLanguageName ? selectedLanguageName : event && event.hasOwnProperty("label") && event.label} - Grouped by ${(filter === "domains") ? "Domain" : (filter === "source") ? "Source" : filter === "collectionMethod_collectionDescriptions" ? "Collection Method" :filter === "primarySubmitterName" ? "Submitter": "Domain"}`)
					setAxisValue({yAxis:("Count"),xAxis:(filter === "domains") ? "Domain" : (filter === "source") ? "Source" : filter === "collectionMethod_collectionDescriptions" ? "Collection Method" : filter === "primarySubmitterName" ? "Submitter": "Domain"})
					
				} else if (page === 2) {
					setTitle(`Number of sentences in ${selectedLanguageName}${filterValue === "primarySubmitterName"? "by" :"of"} ${event.label?event.label : dataValue }  - Grouped by ${(filter === "domains") ? "Domain" :  filter === "collectionMethod_collectionDescriptions" ? "Collection Method": filter === "primarySubmitterName" ? "Submitter" : "Domain"}`)
					setAxisValue({yAxis:("Count"),xAxis:(filter === "domains") ? "Domain" :  filter === "collectionMethod_collectionDescriptions" ? "Collection Method": filter === "primarySubmitterName" ? "Submitter": "Domain"})
					
				}
				
				break;
			case 'asr-corpus':
				if (page === 0) {
					selectedOption.value !== dataSet.value && fetchChartData(dataSet.value, "", [{"field": "sourceLanguage","value": null}])
					setAxisValue({xAxis:"Languages",yAxis:"Hours"})
					setTitle("Number of audio hours per language")
				} else if (page === 1) {
					setTitle(`Number of audio hours in ${selectedLanguageName ? selectedLanguageName : event && event.hasOwnProperty("label") && event.label} - Grouped by ${(filter === "domains") ? "Domain" : (filter === "source") ? "Source" : filter === "collectionMethod_collectionDescriptions" ? "Collection Method" :filter === "primarySubmitterName" ? "Submitter": "Domain"}`)
					setAxisValue({yAxis:("Hours"),xAxis:(filter === "domains") ? "Domain" : (filter === "source") ? "Source" : filter === "collectionMethod_collectionDescriptions" ? "Collection Method" : filter === "primarySubmitterName" ? "Submitter": "Domain"})
					
				} else if (page === 2) {
					setTitle(`Number of audio hours in ${selectedLanguageName} ${filterValue === "primarySubmitterName"? "by" :"of"} ${event.label?event.label : dataValue }  - Grouped by ${(filter === "domains") ? "Domain" :  filter === "collectionMethod_collectionDescriptions" ? "Collection Method":filter === "primarySubmitterName" ? "Submitter": "Domain"}`)
					setAxisValue({yAxis:("Hours"),xAxis:(filter === "domains") ? "Domain" :  filter === "collectionMethod_collectionDescriptions" ? "Collection Method": filter === "primarySubmitterName" ? "Submitter": "Domain"})
					
				}

				break;
			case 'ocr-corpus':

				if (page === 0) {
					selectedOption.value !== dataSet.value && fetchChartData(dataSet.value, "", [{"field": "sourceLanguage","value": null}])
					setTitle("Number of images per language")
					setAxisValue({xAxis:"Languages",yAxis:"Count"})
				} else if (page === 1) {
					setTitle(`Number of images with ${selectedLanguageName ? selectedLanguageName : event && event.hasOwnProperty("label") && event.label} text - Grouped by ${(filter === "domains") ? "Domain" : (filter === "source") ? "Source" : filter === "collectionMethod_collectionDescriptions" ? "Collection Method" :filter === "primarySubmitterName" ? "Submitter": "Domain"}`)
					setAxisValue({yAxis:("Count"),xAxis:(filter === "domains") ? "Domain" : (filter === "source") ? "Source" : filter === "collectionMethod_collectionDescriptions" ? "Collection Method" : filter === "primarySubmitterName" ? "Submitter": "Domain"})
					
				} else if (page === 2) {
					setTitle(`Number of images with ${selectedLanguageName} text ${filterValue === "primarySubmitterName"? "uploaded by" :"of"} ${event.label?event.label : dataValue }  - Grouped by ${(filter === "domains") ? "Domain" :  filter === "collectionMethod_collectionDescriptions" ? "Collection Method":filter === "primarySubmitterName" ? "Submitter": "Domain"}`)
					setAxisValue({yAxis:("Count"),xAxis:(filter === "domains") ? "Domain" :  filter === "collectionMethod_collectionDescriptions" ? "Collection Method": filter === "primarySubmitterName" ? "Submitter": "Domain"})
					
				}
				

				break;
				case 'asr-unlabeled-corpus':

					if (page === 0) {
						selectedOption.value !== dataSet.value && fetchChartData(dataSet.value, "", [{"field": "sourceLanguage","value": null}])
						setAxisValue({xAxis:"Languages",yAxis:"Hours"})
						setTitle("Number of audio hours per language")
					} else if (page === 1) {
						setTitle(`Number of audio hours in ${selectedLanguageName ? selectedLanguageName : event && event.hasOwnProperty("label") && event.label} - Grouped by ${(filter === "domains") ? "Domain" : (filter === "source") ? "Source" : filter === "collectionMethod_collectionDescriptions" ? "Collection Method" :filter === "primarySubmitterName" ? "Submitter": "Domain"}`)
						setAxisValue({yAxis:("Hours"),xAxis:(filter === "domains") ? "Domain" : (filter === "source") ? "Source" : filter === "collectionMethod_collectionDescriptions" ? "Collection Method" : filter === "primarySubmitterName" ? "Submitter": "Domain"})
						
					} else if (page === 2) {
						setTitle(`Number of audio hours in ${selectedLanguageName} ${filterValue === "primarySubmitterName"? "by" :"of"} ${event.label} - Grouped by ${(filter === "domains") ? "Domain" :  filter === "collectionMethod_collectionDescriptions" ? "Collection Method":filter === "primarySubmitterName" ? "Submitter": "Domain"}`)
						setAxisValue({yAxis:("Hours"),xAxis:(filter === "domains") ? "Domain" :  filter === "collectionMethod_collectionDescriptions" ? "Collection Method": filter === "primarySubmitterName" ? "Submitter":"Domain"})
						
					}
	
					break;
			default:
				setTitle("")
		}
	}
	return (

		<section className="section dashboard" style={{background:"white"}}>
        <div class="shape1"><img src={image} alt="shapes"/></div>
       
                
                   
                    <div class="text-center">
                        <h2 class="text-center text-black mt-3">Dataset Dashboard</h2>
                    <p class="">ULCA claims to be the largest repository of datasets of Indic languages</p>
                   
                    </div>
                    <div class="dashboard-map">
                        
                    
			<div className={classes.container}>
				<Paper elevation={0} className={classes.paper}>	
				
        <TitleBar selectedOption=	{selectedOption}
				handleSelectChange=	{handleSelectChange}
				options		=	{options}
				isDisabled	=	{page !== 0 ? true : false}
				page		= 	{page}
				count 		= 	{total}
				>
				{page === 1 ? fetchFilterButtons() : page === 2 ?fetchButtonssecondLevel():"" }
				
			</ TitleBar>
			<div className={classes.iconStyle}>
					 	<><Button size="small" color="primary" className={classes.backButton} style={page === 0 ? {visibility:"hidden"}:{}} startIcon={<ArrowBack />} onClick={() => handleCardNavigation()}>Back</Button></>
						 {(selectedOption.value ==="parallel-corpus" && page===0 )? 
						<div className= {classes.titleStyle}>
						
						<Typography className={classes.titleText} value="" variant="h6"> {title} </Typography>
						<div className={classes.dropDownStyle}>
						{renderTexfield("select-source-language", "Source Language *")}
						<Typography  value="" variant="h6">({count ? (new Intl.NumberFormat('en').format(count)):0})</Typography>
						</div> 
						</div>
						:
						<Typography className={classes.titleText} value="" variant="h6"> {title} <span>({count ? (new Intl.NumberFormat('en').format(count)):0})</span></Typography>}	
					</div>
					
					<div className={classes.title}>
						<ResponsiveContainer width="95%" height={550} >
							<BarChart width={900} height={350} data={data} fontSize="14px" fontFamily="Roboto" maxBarSize={100} >

								<XAxis dataKey="label"
									textAnchor={"end"}
									tick={{ angle: -30, marginTop: "8px" }}
									height={130}
									interval={0}
									position="insideLeft"
									type="category"
									label={{ value: axisValue.xAxis, position: 'insideRight', offset: 0 }}
								>
								</XAxis>
								<YAxis padding={{ top: 30 }} label={{ value: axisValue.yAxis, angle: -90, position: 'insideLeft' }} tickInterval={10} allowDecimals={false} type="number" dx={0} tickFormatter={(value) => new Intl.NumberFormat('en', { notation: "compact" }).format(value)} />


								<Tooltip contentStyle={{fontFamily:"Roboto", fontSize:"14px"}} formatter={(value) => new Intl.NumberFormat('en').format(value)} cursor={{ fill: 'none' }} />
								<Bar margin={{ top: 140, left: 20, right: 20, bottom: 20 }} dataKey="value" cursor="pointer" radius={[8, 8, 0, 0]} maxBarSize={65} onClick={(event) => { handleOnClick(page + 1, event) }}>
									<LabelList
										formatter={(value) => new Intl.NumberFormat('en').format(value)} cursor={{ fill: 'none' }}
										position="top"
										
										dataKey="value"
										fill="black"
										style={{textAnchor:"start"}}
										angle={-30}
										clockWise={4}
									/>
									{
										data.length > 0 && data.map((entry, index) => {
											const color = colors[index < 9 ? index : index % 10]
											return <Cell key={index} fill={`#${color}`} />;
										})
									}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>

				</Paper> 
			</div>
			</div>
               
       
    </section>	
	)
}
export default withStyles(ChartStyles())(ChartRender);
