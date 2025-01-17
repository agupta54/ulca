const DataSet = (theme) => ({
  paper: {
    minHeight: "674px",
    boxShadow: "0px 0px 2px #00000029",
    border: "1px solid #0000001F",
  },
  parentPaper: {
    minHeight: "56px",
    maxWidth: "1272px",
    width: "100%",
    margin: "17px auto",
    padding: "0",
  },
  title: {
    marginBottom: "6vh",
  },
  description: {
    width: "95%",
  },
  form: {
    marginTop: "1vh",
    width: "90%",
  },
  radioGroup: {
    marginTop: "1vh",
  },
  computeBtn: {
    backgroundColor: '#FD7F23',
    float: 'right',
    marginRight: '30px',
    marginTop: '33px',
    '&:hover': {
      backgroundColor: '#FD7F23',
    }
  },
  tableRow: { display: "none" },

  divStyle: {
    padding: "5% 10% 5% 3.125rem",
  },

  typography: { marginBottom: "14px" },
  marginValue: { marginTop: "18px", color: "#0C0F0FB3" },

  list: {
    marginLeft: "-20px",
  },
  center: {
    display: "flex",
    justifyContent: "center",
    marginLeft: "auto",
  },
  centerAudio: {
    display: "flex",
    justifyContent: "center",
    marginLeft: "auto",
    marginTop: "6px",
  },
  titleCard: {
    display: "flex",
    // alignItems: 'flex-end'
    alignItems: "center",
    paddingLeft: "20px",
  },

  updateBtn: {
    display: "flex",
    justifyItems: "center",
    marginTop: "-4%",
  },

  submitBtn: {
    marginTop: "6vh",
    color: "white",
  },
  breadcrum: {
    marginBottom: "1.5rem",
  },
  link: {
    marginRight: "10px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "row",
  },
  span: {
    color: "#0C0F0F",
    opacity: "0.5",
    margin: "-3px 0 0 1rem",
  },

  searchDataset: {
    maxHeight: "1.875rem",
    heigth: "auto",
  },
  submittedOn: {
    display: "block",
    marginTop: "-0.3rem",
  },
  updateDataset: {
    padding: "2rem",
    width: "21rem",
  },
  datasetName: {
    borderBottom: "1px solid #e0e1e0",
    borderTop: "1px solid #e0e1e0",
  },
  popOver: {
    marginTop: "0.3rem",
  },
  footerButtons: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
    padding: ".6rem 1rem",
    boxSizing: "border-box",
    border: "1px solid rgb(224 224 224)",
    background: "white",
    marginTop: "-3px",
  },

  headerButtons: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
    marginBottom: ".6rem",
    boxSizing: "border-box",
  },
  buttonStyle: {
    marginLeft: "0.7rem",
    // borderRadius: "1rem",
  },
  iconStyle: { marginRight: ".5rem" },
  thumbsUpIcon: {
    margin: "24% 0 0 24%",
    fontSize: "3.7rem",
  },

  thumbsUpIconSpan: {
    width: "6.5rem",
    height: "6.5rem",
    backgroundColor: "#e0e1e0",
    borderRadius: "100%",
    display: "block",
  },
  submissionIcon: {
    "@media (max-width:1120px)": {
      display: "none",
    },
  },

  dataSubmissionGrid: {
    padding: "5%",
  },
  thankYouTypo: {
    marginTop: "20px",
    color: "#FD7F23",
  },
  reqNoTypo: {
    marginTop: "10px",
    marginBottom: "20px",
  },
  myContriBtn: {
    marginTop: "20px",
  },
  noteTypo: { marginTop: "40px", marginBottom: "20px" },
  ButtonRefresh: {
    marginLeft: "auto",
    borderRadius: "1rem",
  },
  searchDivStyle: {
    //padding: '0% 4%',
    margin: "1% 2.5% 0 2.5%",
  },
  buttonDiv: {
    margin: "0% 0 1.5rem 0",
  },
  innerButton: {
    margin: "0 0.938rem 0.625rem 0",
  },
  subHeader: {
    marginBottom: "1.313rem",
  },
  autoComplete: {
    marginBottom: "1.938rem",
  },
  clearNSubmit: {
    // marginTop: "20rem",
    float: "right",
  },
  parent: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    height: window.innerHeight - 80,
  },
  modelTable: {
    marginTop: "2rem",
  },
  action: { display: "flex", flexDirection: "row" },
  FindInPageIcon: { fontSize: "8rem" },
  searchResult: {
    textAlign: "center",
    justifyContent: "center",
    flexDirection: "column",
    display: "flex",

    verticalAlign: "middle",
    "@media (max-width:850px)": {
      minWidth: "270px",
      width: "85%",
    },
  },
  reqPaper: {
    // padding:'10%',
    // width:'60%'
    marginTop: "25%",
  },
  alignTypo: {
    textAlign: "center",
  },
  yourSearchQuery: {
    marginBottom: "2%",
    color: '#FD7F23'
  },
  serReqNoTypo: {
    marginBottom: "7%",
  },
  mySearches: {
    marginTop: "3%",
    width: "60%",
    //  textTransform:'inherit'
  },
  downloadDiv: {
    marginTop: "4%",
  },
  downloadPaper: {
    marginTop: "4%",
    padding: "5% 14% 2% 4%",
    width: "70%",
    minHeight: "3.5rem",
    backgroundColor: '#D6EAF8'
  },
  downloadBtnDiv: {
    margin: "10%",
    marginLeft: "0",
    display: "flex",
    flexDirection: "row",
  },
  searchResultFinal: {
    width: "90%",
    marginTop: "-20%",
  },
  downloadBtn: {
    marginRight: "2%",
  },

  blurOut: {
    zIndex: -2,
    opacity: "0.5",
  },
  leftSection: {
    boxShadow: "4px 0 4px -4px #00000029",
  },
  popupDialog: {
    maxWidth: "46.125rem",
    height: "26.5rem",
  },
  clearAllBtn: {
    float: "right",
    margin: "9px 16px 0px auto",
    padding: "0",
    height: "15px",
  },
  filterContainer: {
    borderBottom: "1px solid #00000029",
    paddingLeft: "18.5px",
    marginTop: "20px",
    width: "600px",
    maxHeight: "270px",
    overflow: "auto",
    "@media (max-width:550px)": {
      width: "330px",
      maxHeight: "170px",
    },
  },
  filterTypo: {
    marginBottom: "9px",
  },
  applyBtn: {
    float: "right",
    borderRadius: "20px",
    margin: "9px 16px 9px auto",
    width: "80px",
  },
  clrBtn: {
    float: "right",
    borderRadius: "20px",
    margin: "9px 10px 9px auto",
    width: "100px",
  },
  menuStyle: {
    padding: "0px",
    justifyContent: "left",
    fontSize: "1.125rem",
    fontWeight: "500 !important",
    "&:hover": {
      backgroundColor: "white",
    },
    borderBottom: "1px solid rgba(0, 0, 0, 0.42)",
    // borderTop:"3px solid green",
    "& svg": {
      marginLeft: "auto",
      color: "rgba(0, 0, 0, 0.42)",
    },
  },
  container: {
    margin: "12.75px 0px 18px 15px",
  },
  browseBtn: {
    marginTop: "-20px",
  },
  contriCard: {
    width: "578px",
    minHeight: "100px",
    margin: "10px",
    padding: "0px 10px",
    "@media (max-width:1250px)": {
      width: "500px",
    },
    "@media (max-width:900px)": {
      width: "350px",
    },
    "@media (max-width:700px)": {
      width: "350px",
    },
  },
  typeTypo: {
    marginTop: "6.25px",
    opacity: ".5",
  },
  Typo: {
    marginTop: "6.25px",
  },
  nameTypo: {
    marginTop: "6.25px",
    fontWeight: "500",
  },

  gridHeader: { padding: "13px 24px 14px 24px", display: "flex" },
  gridTypo: { marginTop: "4px" },
  gridData: {
    display: "flex",
    flexWrap: "wrap",
    alignContent: "flex-start",
    marginLeft: "14px",
    minHeight: "550px",
  },
  styleHr: {
    maxWidth: "24px",
    justifyItems: "flex-start",
    display: "inline-flex",
    width: "100%",
    margin: 0,
    marginBottom: "7.5px",
    // border:"4px solid #1DB5D8",
    borderRadius: "3px",
    height: "4px",
    border: "none",
    background: "#FD7F23",
  },
  subType: {
    marginBottom: "18.5px",
  },
  computeGrid: {
    display: "flex",
    alignItems: "flex-end",
    // alignItems: 'center'
  },
  modelTitle: {
    marginTop: "20px",
    // padding: 0,
  },
  mainTitle: { marginTop: "33px", marginLeft: '38px' },
  backButton: {
    boxShadow: "none",
    padding: "0",
  },
  gridCompute: { marginTop: "15px " },
  grid: { marginRight: "15px " },
  hosted: {
    display: "flex",
    // alignItems: 'flex-end'
    alignItems: "center",
  },
  translatedCard: {
    height: "300px",
    borderColor: "#2D63AB",
    borderRadius: "8px",
    marginTop: "20px",
    marginRight: "24px",
  },
  asrCard: {
    height: "300px",
    width: "100%",
    borderColor: "#2D63AB",
    borderRadius: "8px",
    margin: "20px 20px 20px 0px",
  },
  computeBtnUrl: {
    marginTop: "40px",
    "@media (max-width:1000px)": {
      marginTop: "10px",
    },
  },
  textArea: {
    backgroundColor: "inherit",
    border: "none",
    width: "100%",
    resize: "none",
    outline: "none",
    fontSize: "18px",
    lineHeight: "32px",
    color: "black",
    fontFamily: "Roboto",
    //    paddingLeft:'16px'
  },
  hostedCard: {
    height: "300px",
    borderColor: "#2D63AB",
    borderRadius: "8px",
    paddingBottom: "13px",
    marginRight: "24px",
  },
  cardHeader: {
    backgroundColor: "#F4F7FB",
    height: "52px",
    alignItems: "center",
  },
  headerContent: {
    marginLeft: "18px",
  },
  actionButtons: {
    marginBottom: "13px",
    float: "right",
    marginRight: "20px",
  },
  translateCard: {
    padding: 0,
  },
  modelPara: {
    //marginTop: "15px ",
    //textTransform: 'capitalize'
    "&:first-letter": { textTransform: "capitalize" },
    display: "-webkit-box",
    "-webkit-line-clamp": "2",
    "-webkit-box-orient": "vertical",
    overflow: "hidden",
  },
  mainPaper: {
    border: "none",
  },
  submitPaper: {
    textAlign: "center",
    width: "624px",
    height: "620px",
    margin: "auto",
    padding: "70px 59px 0 59px",
    marginTop: "51px",
    marginBottom: "118px",
  },
  benchmarkActionButtons: {
    borderRadius: "16px",
    backgroundColor: "white",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "white",
      boxShadow: "none",
    },
  },
  search: {
    position: "relative",
    borderRadius: "24px",
    backgroundColor: "#F3F3F3",
    marginLeft: 0,
    width: "220px",
    textAlign: "left",
    float: "right",
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#00000029",
  },
  gridAlign: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(3)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
    },
    fontStyle: "italic",
    fontSize: "14px",
  },
  inputRoot: {
    width: "100%",
  },
  filterBtn: {
    borderRadius: "22px",
  },
  advanceFilter: {
    textAlign: 'right',
    color: "#FD7F23"
  },
  advanceFilterContainer: { maxHeight: "16rem", overflowY: 'auto', overflowX: "hidden", marginTop: "2rem" }
});

export default DataSet;
