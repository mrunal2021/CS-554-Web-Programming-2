import React from 'react'
import { useMutation } from '@apollo/react-hooks';
import queries from '../graphql/queries';

function Newpost() {
    const [uploadImage] = useMutation(queries.UPLOAD_NEW_POST);
    let url, description, posterName;
    return (
        <div>
          <form
            onSubmit={
                        e => {
                        e.preventDefault();
                        uploadImage({ variables: { url: url.value, description: description.value , posterName: posterName.value} });
                        alert("Uploaded");
                        url.value = "";
                        posterName.value= "";
                        description.value= "";
                        }
                    }
            >
            <div className="form-group">
              <label>
                Url :
                <br />
                <input
                  ref={node => {
                      url = node;
                  }}
                  required
                  autoFocus={true}
                  />
              </label>
            </div>
            <br />
            <div className="form-group">
              <label>
                Description :
                <br />
                <input
                  ref={node => {
                      description = node;
                  }}
                  required
                  />
              </label>
            </div>
            <br />
            <div className="form-group">
              <label>
                Poster Name :
                <br />
                <input
                  ref={node => {
                      posterName = node;
                  }}
                  required
                  />
              </label>
            </div>
            <button className="btn btn-primary" type="submit">Create New Post</button>
          </form>
        </div>
    )
}

export default Newpost
