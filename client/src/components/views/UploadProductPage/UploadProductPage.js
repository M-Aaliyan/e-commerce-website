import React, { useState } from 'react'
import { Typography, Button, Form, message, Input } from 'antd';
import FileUpload from '../../utils/FileUpload'
import axios from 'axios';

const { Title } = Typography;
const { TextArea } = Input;

const Continents = [
    { key: 1, value: "Africa" },
    { key: 2, value: "Europe" },
    { key: 3, value: "Asia" },
    { key: 4, value: "North America" },
    { key: 5, value: "South America" },
    { key: 6, value: "Australia" },
    { key: 7, value: "Antarctica" }
]

function UploadProductPage(props) {

    const [state , setState] = useState({
        title : "",
        description : "",
        price : ""
    })
    const [ContinentValue, setContinentValue] = useState(1)
    
    const [Images, setImages] = useState([])

    const handleChange = e => {
        const {name , value} = e.target

        setState( prevState => ({
            ...prevState,
            [name] : value
        }))
    }

    const onContinentsSelectChange = (event) => {
        setContinentValue(event.currentTarget.value)
    }

    const updateImages = (newImages) => {
        console.log(newImages)
        setImages(newImages)
    }

    const onSubmit = (event) => {
        event.preventDefault();

        const variables = {
            writer: props.user.userData._id,
            title: state.title,
            description: state.description,
            price: state.price,
            images: Images,
            continents: ContinentValue
        }

        axios.post('/api/product/uploadProduct' , variables)
            .then(response =>{
                if(response.data.success){
                    alert('Product Successfully uploaded')
                    props.history.push('/')

                } else{
                    alert('Failed to upload Product')
                }
            })
    }

    return (
        <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Title level={2}> Upload Travel Product</Title>
            </div>
            <Form onSubmit={onSubmit} >

                {/* DropZone */}
                <FileUpload refreshFunction={updateImages}/>

                <br />
                <br />
                <label>Title</label>
                <Input
                    onChange={handleChange} 
                    value={state.title} name="title"
                />
                <br />
                <br />
                <label>Description</label>
                <TextArea
                    onChange={handleChange} 
                    value={state.description} name="description"
                />
                <br />
                <br />
                <label>Price($)</label>
                <Input
                    onChange={handleChange} 
                    value={state.price} name="price"
                    type="number"
                />
                <br /><br />
                <select onChange={onContinentsSelectChange} value={ContinentValue}>
                    {Continents.map(item => (
                        <option key={item.key} value={item.key}>{item.value} </option>
                    ))}
                </select>
                <br />
                <br />

                <Button
                    onClick={onSubmit}
                >
                    Submit
                </Button>

            </Form>

        </div>
    )
}

export default UploadProductPage