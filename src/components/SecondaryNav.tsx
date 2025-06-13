import { ExpandMore } from "@mui/icons-material"
import {
  Select,
  MenuItem,
  Button,
  Link,
  AppBar,
  Toolbar,
  SelectChangeEvent,
  FormControl,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { Link as RouterLink } from "react-router"

import { setProjectId } from "features/projectIdSlice"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { resetSubmission } from "features/wizardSubmissionSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import { RootState } from "rootReducer"
import { pathWithLocale } from "utils"

const StyledSecondaryNavBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: "none",
  borderBottom: `6px solid ${theme.palette.primary.light}`,
  position: "fixed",
  top: "6.4rem",
  left: 0,
  right: 0,
  zIndex: 1200,
}))
const ProjectDropdown = styled(FormControl)(({ theme }) => ({
  marginTop: "1rem",
  marginBottom: "2rem",
  "& .MuiOutlinedInput-root": {
    width: "40rem",
    height: "4rem",
    backgroundColor: theme.palette.common.white,
    border: `0.15rem solid ${theme.palette.secondary.main}`,
    borderRadius: "0.375rem",
    color: theme.palette.primary.main,
  },
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "& svg": { fontSize: "2rem" },
}))
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: "1rem",
  "&.Mui-selected, &.Mui-selected:hover": {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
  },
  "&:hover": {
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: "0.375rem",
  },
}))

const SecondaryNav: React.FC = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state: RootState) => state.user)
  const projectId = useAppSelector((state: RootState) => state.projectId as string)

  const handleProjectIdChange = (event: SelectChangeEvent<string>) => {
    dispatch(setProjectId(event.target.value))
  }

  const resetWizard = () => {
    dispatch(resetObjectType())
    dispatch(resetSubmission())
  }

  const projectSelection = (
    <ProjectDropdown data-testid="project-id-selection">
      <Select
        value={projectId ? projectId : ""}
        onChange={handleProjectIdChange}
        inputProps={{ "aria-label": "Select project id" }}
        IconComponent={ExpandMore}
        sx={{ ".MuiSelect-icon": { color: "primary.main" } }}
      >
        {user.projects.map(project => (
          <StyledMenuItem key={project.projectId} value={project.projectId}>
            {`Project_${project.projectId}`}
          </StyledMenuItem>
        ))}
      </Select>
    </ProjectDropdown>
  )

  return (
    <StyledSecondaryNavBar>
      <Toolbar sx={{ pt: 2 }}>
        <div>{projectSelection}</div>
        <Link component={RouterLink} to={pathWithLocale("submission?step=1")} sx={{ ml: "auto" }}>
          <Button
            color="primary"
            variant="contained"
            onClick={resetWizard}
            data-testid="link-create-submission"
          >
            Create submission
          </Button>
        </Link>
      </Toolbar>
    </StyledSecondaryNavBar>
  )
}

export default SecondaryNav
