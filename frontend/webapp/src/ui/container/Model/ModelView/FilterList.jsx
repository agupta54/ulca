import React from "react";
import DataSet from "../../../styles/Dataset";
import {
    withStyles,
    Button,
    Divider,
    Grid,
    Typography,
    Popover,
    FormGroup,
    Checkbox,
    FormControlLabel,
} from "@material-ui/core";

const FilterBenchmark = (props) => {
    const {
        classes,
        clearAll,
        filter,
        selectedFilter,
        id,
        open,
        anchorEl,
        handleClose,
        apply,
    } = props;

    const isChecked = (type, property) => {
        return selectedFilter[property].indexOf(type) > -1 ? true : false;
    };

    const isDisabled = () => {
        const keys = Object.keys(selectedFilter);
        for (let i = 0; i < keys.length; i++) {
            if (selectedFilter[keys[i]].length > 0) {
                return false;
            }
        }
        return true;
    }

    return (
        <div>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <Grid
                    container
                    style={{
                        maxWidth: "938.53px",
                        // maxHeight: "290.22px",
                        overflow: "auto",
                    }}
                >
                    <Grid
                        item
                        xs={3}
                        sm={3}
                        md={3}
                        lg={3}
                        xl={3}
                    >
                        <Typography variant="h6" className={classes.filterTypo}>
                            Task
                        </Typography>
                        <FormGroup>
                            {filter.modelType.map((type) => {
                                return (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={isChecked(type, 'modelType')}
                                                name={type}
                                                color="primary"
                                                onChange={() => props.handleCheckboxClick(type, 'modelType')}
                                            />
                                        }
                                        label={type}
                                    />
                                );
                            })}
                        </FormGroup>
                    </Grid>
                    <Grid
                        item
                        xs={3}
                        sm={3}
                        md={3}
                        lg={3}
                        xl={3}
                    >
                        <Typography variant="h6" className={classes.filterTypo}>
                            Domain
                        </Typography>
                        <FormGroup>
                            {filter.domain.map((type) => {
                                return (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={isChecked(type, 'domain')}
                                                name={type}
                                                color="primary"
                                                onChange={props.handleCheckboxClick}
                                            />
                                        }
                                        label={type}
                                    />
                                );
                            })}
                        </FormGroup>
                    </Grid>
                    <Grid
                        item
                        xs={3}
                        sm={3}
                        md={3}
                        lg={3}
                        xl={3}
                    >
                        <Typography variant="h6" className={classes.filterTypo}>
                            License
                        </Typography>
                        <FormGroup>
                            {filter.license.map((type) => {
                                return (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={isChecked(type, 'license')}
                                                name={type}
                                                color="primary"
                                                onChange={props.handleCheckboxClick}
                                            />
                                        }
                                        label={type}
                                    />
                                );
                            })}
                        </FormGroup>
                    </Grid>
                    <Grid
                        item
                        xs={3}
                        sm={3}
                        md={3}
                        lg={3}
                        xl={3}
                    >
                        <Typography variant="h6" className={classes.filterTypo}>
                            Status
                        </Typography>
                        <FormGroup>
                            {filter.status.map((type) => {
                                return (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={isChecked(type, 'status')}
                                                name={type}
                                                color="primary"
                                                onChange={props.handleCheckboxClick}
                                            />
                                        }
                                        label={type}
                                    />
                                );
                            })}
                        </FormGroup>
                    </Grid>
                </Grid>
                <Divider />
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "9px 0",
                        width: "238.53px",
                    }}
                >
                    <Button
                        onClick={clearAll}
                        variant="outlined"
                        style={{
                            width: "100px",
                            marginRight: "10px",
                            marginLeft: "34.2px",
                            borderRadius: "20px",
                        }}
                        disabled={isDisabled()}
                    >
                        {" "}
                        Clear All
                    </Button>
                    <Button
                        color="primary"
                        variant="contained"
                        style={{ width: "80px", borderRadius: "20px" }}
                        disabled={isDisabled()}
                        onClick={apply}
                    >
                        {" "}
                        Apply
                    </Button>
                </div>
            </Popover>
        </div>
    );
};

export default withStyles(DataSet)(FilterBenchmark);
