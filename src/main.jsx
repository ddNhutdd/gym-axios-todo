import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: 'https://jsonplaceholder.typicode.com/todos',
	timeout: 180_000,
});

const apiStatus = {
	pending: 'pending',
	fetching: 'fetching',
	fullfilled: 'fullfilled',
	rejected: 'rejected'
}
const useCallApi = (immediately, functionName, ...params) => {
	const [mainData, setMainData] = useState();
	const [error, setError] = useState();
	const [status, setStatus] = useState(apiStatus.pending);
	const firstLoad = useRef(false);

	async function call(...newParams) {
		try {
			if (status === apiStatus.fetching) {
				return;
			}
			setStatus(apiStatus.fetching);
			const resp = await functionName(newParams);
			setMainData(resp);
			setError(undefined);
			setStatus(apiStatus.fullfilled)

		} catch (error) {
			setError(error)
			setStatus(apiStatus.rejected)
		}
	}

	if (immediately && !firstLoad.current) {
		firstLoad.current = true;
		call(...params)
	}

	return [mainData, error, status, call];
}


function App() {
	// post data
	const [postStatus, setPostStatus] = useState(apiStatus.pending);
	const PostListTodo = async (data) => {
		try {
			if (postStatus === apiStatus.fetching) {
				return;
			}
			setPostStatus(apiStatus.fetching);
			const resp = await axiosInstance.post('', data);
			setPostStatus(apiStatus.fullfilled);
			setValue('');
			alert(resp?.status);
		} catch (error) {
			setPostStatus(apiStatus.rejected)
		}
	}

	// get all list
	const fetchListTodo = () => {
		return axiosInstance.get('');
	}
	const [listTodo, listTodoFetchError, listTodoStatus,] = useCallApi(true, fetchListTodo);
	const renderTableBody = () => {
		const list = listTodo?.['data'];
		return list?.map(item => (
			<tr key={item?.id}>
				<td>{item?.title}</td>
				<td>{item?.completed ? 'done' : 'not yet'}</td>
			</tr>
		))

	}

	//input value 
	const [value, setValue] = useState('');
	const valueChangeHandle = (event) => {
		setValue(event.target.value)
	}

	// form
	const formSubmitHandle = async (event) => {
		event.preventDefault();
		await PostListTodo({
			userId: 1,
			title: value,
			completed: false
		})
	}

	if (listTodoFetchError) {
		return <>Load Error</>
	}
	if (listTodoStatus === apiStatus.fetching) {
		return <>Loading</>
	}
	return (
		<>
			<form onSubmit={formSubmitHandle}>
				<label htmlFor="title"></label>
				<input value={value} onChange={valueChangeHandle} type="text" id='title' />
				<button disabled={postStatus === apiStatus.fetching}>Submit</button>
			</form>
			<table>
				<thead>
					<tr>
						<th>
							Title
						</th>
						<th>
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{renderTableBody()}
				</tbody>
			</table>
		</>
	)
}

const root = document.getElementById('root')
if (root !== null) {
	ReactDOM.createRoot(root).render(
		<React.StrictMode>
			<App />
		</React.StrictMode>
	)
}
