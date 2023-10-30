import React, { useEffect, useState } from 'react';
import Editor from '../components/editor';
import { Grid, Box, TextField, Button } from '@mui/material';

function StaticPages() {

    const handleDataChange = (data) => {
        console.log("Editor'dan gelen data:", data);
        console.log(JSON.stringify(data))
        // Gelen data'yı sunucuya kaydetmek veya başka işlemler için kullanabilirsiniz.
    }


    const handleSave =  () => {
        console.log('save')
    };
    const handleClear = ()=>{
        console.log('clear')
    }


    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={9}>
                <div>
                    <Editor initialData={{
                        blocks: [
                            {
                                type: "paragraph",
                                data: {
                                    text: "Hello World"
                                }
                            }
                        ]
                    }} language="tr" onChange={handleDataChange} />
                </div>

            </Grid>
            <Grid item xs={12} sm={3}>
                <Box>

                </Box>
                <Box>
                    <TextField label="Slug URL" fullWidth />
                </Box>
                <Box mt={2}>
                    <Button variant="contained" color="primary" onClick={() => handleSave()}>Save</Button>
                    <Button variant="contained" color="secondary" onClick={handleClear} style={{ marginLeft: '10px' }}>Clear</Button>
                </Box>
            </Grid>
        </Grid>
    );
}

export default StaticPages;
