import React, { Component } from 'react';
import { GridList, GridListTile, Box, Modal, Backdrop, Fade } from '@material-ui/core';
import PostHeader from '../../common/post/PostHeader';
import PostMedia from '../../common/post/PostMedia';
import PostCaption from '../../common/post/PostCaption';
import PostLikes from '../../common/post/PostLikes';
import PostComments from '../../common/post/PostComments';
import PageWithHeader from '../../common/header/PageWithHeader';
import ProfileDetail from '../../common/profile/ProfileDetails';
import ProfileIcon from '../../common/profile/ProfileIcon';
import { postsDetails } from '../../common/Test';
import Config from '../../common/config';
import './Profile.css';


export default class Profile extends Component {
    constructor() {
        super();
        this.state = {
            userPosts: [],
            open: false,
            userPost: {}
        }
        this.logoutUser = this.logoutUser.bind(this);
        this.redirectUserToHomePage = this.redirectUserToHomePage.bind(this);
    }
    logoutUser = () => {
        sessionStorage.clear();
        this.props.history.replace('/');
    }

    // Redirect user to home page when he clicks on the Logo text
    redirectUserToHomePage = () => this.props.history.push('/home');

    // Get component profile avatar with Menu Options and associated Handlers
    getProfileAvatar = () => {
        return (
            <Box ml="auto" display="flex" flexDirection="row" alignItems="center">
                <ProfileIcon type="avatarWithMenu" menuOptions={['Logout']} handlers={[this.logoutUser]} />
            </Box>);
    };

    // Fetch user's posts by making a API call
    async componentDidMount() {
        if (!Config.api.mock) {
            let accessToken = window.sessionStorage.getItem("access-token");
            let getPostsURI = Config.api.endpoints.find((endpoint) => endpoint.name === "Get Posts").uri.replace('$accessToken', accessToken);
            let getPostDetailsURI = Config.api.endpoints.find((endpoint) => endpoint.name === "Get Post Details").uri.replace('$accessToken', accessToken);
    
            let response = await fetch(getPostsURI);
            let posts = await response.json();
            posts = posts.data;
    
            for (let i = 0; i < posts.length; i++) {
                response = await fetch(getPostDetailsURI.replace('$postId', posts[i].id));
                let details = await response.json();
                posts[i].media_type = details.media_type;
                posts[i].media_url = details.media_url;
                posts[i].username = details.username;
                posts[i].timestamp = details.timestamp;
                posts[i].comments = [];
                posts[i].isLiked = false;
                posts[i].numLikes = Math.round(100 + Math.random() * 100);
            }
            this.setState({userPosts: posts});
        }
        else {
            this.setState({userPosts: postsDetails});
        }
        
    }

    // Handler to open post modal
    openPostDetails = (e) => {
        this.setState({ open: true, userPost: this.state.userPosts.find((post) => post.id === e.target.id) });
    }

    // Handler to close post modal
    closePostDetails = (e) => {
        this.setState({ open: false, userPost: {} });
    }

    render() {
        return (
            <PageWithHeader title="Image Viewer" positionLeft={this.getProfileAvatar}>
                {
                    (this.state.userPosts.length > 0) ?
                        (<Box><ProfileDetail className="profile-detail" userName={this.state.userPosts[0].username} numPosts={this.state.userPosts.length}
                            fullName="Anup Shanbhag" follows={Math.round(500 + Math.random() * 500)}
                            followers={Math.round(1000 + Math.random() * 1000)} />
                            < Box className="image-grid">
                                <GridList cellHeight={300} cols={3}>
                                    {this.state.userPosts.map((userPost) => (
                                        <GridListTile key={userPost.id} >
                                            <img id={userPost.id} src={userPost.media_url} alt={userPost.id} onClick={this.openPostDetails} />
                                        </GridListTile>
                                    ))}
                                </GridList>
                            </Box>

                            <Modal className="modal" open={this.state.open}
                                onClose={this.closePostDetails} closeAfterTransition BackdropComponent={Backdrop}>
                                <Fade in={this.state.open}>
                                    <Box width="60%" display="flex" flexDirection="row" justifyContent="space-evenly" className="modal-content">
                                        <Box m="1%" width="50%" className="image-container" >
                                            {(this.state.userPost.media_url) ? <PostMedia media={this.state.userPost.media_url} mediaId={this.state.userPost.id} minWidth="350px" minHeight="350px" /> : ""}
                                        </Box>
                                        <Box m="2%" width="50%" display="flex" flexDirection="column" justifyContent="left" alignItems="center">
                                            <PostHeader postUser={this.state.userPost.username} postedTime={this.state.userPost.timestamp} />
                                            <PostCaption mb="auto" text={this.state.userPost.caption} />
                                            <Box mt="auto" width="100%">
                                                <PostComments postUser={this.state.userPost.username} >
                                                    <PostLikes likes={this.state.userPost.numLikes} />
                                                </PostComments>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Fade>
                            </Modal>
                        </Box>) : ""}
            </PageWithHeader>
        );
    }
}