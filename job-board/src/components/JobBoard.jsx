import { useEffect, useState } from "react"
import './JobBoard.css'
const JobBoard = () => {
    const [jobIds, setJobids] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [isFetching, setIsFeching] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const JOBSPERPAGE = 15;
    const fetchJobs = async (page = currentPage) => {
        try{
            setIsFeching(true);
            setCurrentPage(page);
            let jobIdList  = jobIds; 
            if(jobIds === null){
                let response = await fetch("https://hacker-news.firebaseio.com/v0/jobstories.json").then(result => result.json())
                jobIdList = response;
                setJobids(response);
            }
            if(jobIdList && jobIdList.length>0){
                const jobIdsPerPage = jobIdList.slice(page*JOBSPERPAGE, page*JOBSPERPAGE+JOBSPERPAGE);
                const jobPromises = jobIdsPerPage.map(async jobid => {
                    return fetch(`https://hacker-news.firebaseio.com/v0/item/${jobid}.json`)
                    .then(jobResponse =>  jobResponse.json())
                    .catch(err => {
                        console.warn("Failed to fetch job with id",jobid, err);
                        return null;
                    })
                })
                const results = await Promise.allSettled(jobPromises);
                const successfulJobs = results
                .filter((result) => result.status === 'fulfilled') // Only keep fulfilled promises
                .map((result) => result.value);
                setJobs([...jobs, ...successfulJobs]);
            }
        }catch(err){
            console.log("Error Fetching Jobs Id's", err);
        }finally{
            setIsFeching(false);
        }
    }
    const handleLoadMoreJobs = () => {
        fetchJobs(currentPage+1);
    }
    useEffect(()=> {fetchJobs()}, []);
    return (<div className="jobs-portal">
        <h1>Job Portal</h1>
        {isFetching && jobs.length === 0 && <div>Fetching Jobs....</div>}
        {jobs && jobs.length > 0 && jobs.map(job => {
            return (<div className="jobs-portal__job-con" key={job.id}>
                <div className="jobs-portal__job-con__title">{job.title}</div>
                <div className="jobs-portal__job-con__postDetails">
                    <span className="jobs-portal__job-con__postBy">By {job.by}</span>
                    <span>{job.time}</span>
                </div>
            </div>)
        })}
        {jobIds && jobs.length>0 && jobIds.length > jobs.length && <button onClick={handleLoadMoreJobs}>{isFetching ? "getting jobs..." :"Load More"}</button>}
    </div>);
}
export default JobBoard