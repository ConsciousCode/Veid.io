{doc
	title:Veid.io
	links:{
		"https://fonts.googleapis.com/css?family=Lato"
		"https://fonts.googleapis.com/css?family=Schoolbell"
		css/util.css
		css/main.css
	}
	scripts:{
		js/jquery.min.js
		js/conditional.js
		js/ipfs.js
		js/struct.js
		js/forge.min.js
		js/jsbn.js
		js/jsbn2.js
		js/prng.js
		js/rng.js
		js/rsa.js
		js/rsa2.js
		js/halthash.js
		js/consensus.js
		js/main.js
	}
	
	templates:{
		grid-preview-tpl:[{block
			class:box
			{rows
				class:grid-preview
				{rows
					class:preview
					{link
						class:thumb-container
						{overlay
							{image class:thumb}
							{span class:video-length}
						}
					}
					{cols
						{span class:norm}
						{span class:tips}
					}
				}
				{rows
					class:metadata
					{head 4 class:title}
					{span class:author}
					{cols
						{span class:views}
						{span class:description}
					}
				}
			}
		}]
		
		list-preview-tpl:{cols
			class:list-preview
			{rows
				class:preview
				{link
					class:thumb-container
					{overlay
						{image class:thumb}
						{span class:video-length}
					}
				}
				{cols
					{span class:norm}
					{span class:tips}
				}
			}
			{rows
				class:metadata
				{head 4 class:title}
				{span class:author}
				{cols
					{span class:views}
					{span class:description}
				}
				{span class:description}
			}
		}
		{script js/player.js}
		{rows
			id:info
			{head 3 id:title [Sample Title]}
			{cols
				{cols
					id:creator-info
					{image id:creator-avatar}
					{span id:creator-name [Sample Name]}
					{button id:subscribe class:"interact-button fa fa-star-o"}
				}
				{cols
					id:interact
					{button id:add-genre class:"interact-button fa fa-tags"}
					{rows
						id:preferences
						{cols
							{button
								id:dislike
								class:"interact-button fa fa-fw fa-minus
								tip:"Less of this"
							}
							{button
								id:dislike
								class:"interact-button fa fa-fw fa-plus
								tip:"More of this"
							}
							{button
								id:dislike
								class:"interact-button fa fa-fw fa-heart-o
								tip:Favorite
							}
							{button
								id:dislike
								class:"interact-button fa fa-fw fa-gift
								tip:"Tip the creator"
							}
						}
						{cols
							{span class:norm style:{flex:1}}
							{span class:tips style:{flex:3}}
						}
					}
				}
			}
		}
		{list
			class:tabs
			{block id:site-info
				{button class:"option-button fa fa-info" tip:About}
			}
			{block id:profile
				{button class:"option-button fa fa-user" tip:Profile}
				{block class:"balance no-select"
					{block id:balance 371}
				}
			}
			{block id:search class:active
				{input tip:Search autocomplete:off}
				{button class:"option-button fa fa-search" tip:Search}
			}
			{block id:video-info
				{button class:"option-button fa fa-question" tip:Doobyldoo}
			}
			{block id:flag
				{button class:"option-button fa fa-flag" tip:"Report an issue"}
			}
		}
		{overlay id:omnipanel
			{block rel:section id:site-info-panel [
				{p [(For new users, consider heading to the {link #?special=intro video} we compiled which condenses this information)]}
				{list
					{link #faq-1 "What is this?"}
					{link #faq-2 "How does it work?"}
					{link #faq-3 "How do I use it?"}
					{link #faq-4 "Does that mean I have to pay?"}
					{link #faq-5 "Why have your own virtual currency?"}
					{link #faq-6 "What about content creators?"}
					{link #faq-7 "How can I help a creator more directly?"}
					{link #faq-8 "How are videos recommended?"}
					{link #faq-9 "What about copyrighted material?"}
					{link #faq-10 "Can I advertise?"}
				}
				
				{head 3 FAQ}
				{head 4 id:faq-1 "What is this?"}
				{p [Veid.io is a distributed, crowdsourced video distribution platform using brand new technologies to support a better experience for everyone involved. To put it simply, we're not run by robots; we're run by {em you}. We're a collaborative effort of all those involved, from the storage to the recommendation engine.]}
				{head 4 id:faq-2 "How does it work?"}
				{p [The underlying technologies we will use are {link "https://ipfs.io/ IPFS}, {link "https://filecoin.io/" Filecoin}, and {link "https://enigma.media.mit.edu/" Enigma}. As Filecoin and Enigma are still up and coming, for now we'll be using an ordinary server to host metadata. Enigma allows us to create a distributed virtual server which is run by the users who use the site using blockchain technology and multiparty computation. IPFS enables long term storage of the actual videos using user filesystems, and Filecoin incentivizes longer term storage of those files.]}
				h4#faq-3 How do I use it?
				p Because Enigma requires Bitcoin micropayments to function, you'll need a bitcoin address (??? need more info from Enigma)
				h4#faq-4 Does that mean I have to pay?
				p Yes, but unlike competitors, our business model is based around compensating you for participating. You can watch an ad, vote on the legitimacy of a flag, have your computer perform small "chores" behind the scenes, or even help host the content, and you'll get paid for doing any of these. Alternatively, you can deposit enough for a pizza and not have to worry about it for months. What's most important is that the choice is left up to you, and can be tailored to your personal tastes. And yes, you can net a small profit from your participation.
				h4#faq-5 Why have your own virtual currency?
				p Partly for user convenience (its value is set to #[span.cost 1] = 1 ad and lacks precision beyond 0.01) and partly as an optimization technique. A large number of transactions can occur entirely between users, and it'd be incredibly inefficient and wasteful to deploy a Bitcoin transactions for each one. Instead, users are encouraged to transfer from their account to a Bitcoin address infrequently, when a sizeable amount is accumulated.
				h4#faq-6 What about content creators?
				p Since ads are merely a means to an end to compensate users, it doesn't make sense for videos to have ads. Instead, content creators specify how much money they'd like to charge their viewers. These micropayments will tend to be so small that they'd be barely noticeable, but for a content creator who gets thousands or even millions of views, they'll add up to a legitimate pay, one which they deserve without corporate beaurocracy and convoluted popularity metrics to mess with it.
				h4#faq-7 How can I help a creator more directly?
				p You can host their videos using #[a(href="https://ipfs.io/") IPFS], which makes their videos load faster for other users, or you can tip them an extra micropayment by clicking the gift icon in the interaction bar. Other support can be provided through external services like #[a(href="https://patreon.com/") Patreon].
				h4#faq-8 How are videos recommended?
				p Unlike traditional centralized systems, we can't possibly support a centralized recommendation or popularity engine using advanced AI. Instead, videos have what are called #[em features], and users have similar numbers called #[em preferences]. Initially, these numbers won't mean anything. But the more users favor and unfavor videos, the closer these numbers will change to match intrinsic patterns. The closer a video's features are to your preferences, the more likely you are to like it.
				p Because of this system, videos have no notion of "findability"; a video is recommended solely by its similarity to your preferences and the current video's features regardless of how many views or (un)favors it has. And because content creators are paid solely by views, formats which have been traditionally unsupported like #[em animation] are viable. It's a level playing field.
				h4#faq-9 What about copyrighted material?
				p Uploading copyrighted content is strictly against the community guidelines, and if a copyright strike is approved, you'll lose all profits from that video if applicable. However, as the moderation is crowdsourced from a distrustful incentive system, you can be sure that your videos won't be taken down so long as they're in line with fair use.
				p People generally upload copyrighted content for one of two reasons; personal profit and a desire for easier access to media. Neither is supported by Veid.io, but because of our systems, copyright owners can easily upload their content without fear of it being stolen on a large scale, thus enabling easier access. Because of this, we strongly suggest you try to appeal to the copyright owner to upload their content instead of doing so yourself.
				h4#faq-10 Can I advertise?
				p Yes! We use a CPM model which is currently at around $3. Your ad is uploaded like any ordinary video (along with a JSON containing metadata), and given to users based on the similarity of the feature and preference vectors. At the end, a small captcha is given to the user to verify that they haven't hidden the ad. The captcha is displayed after 5 seconds; we strongly recommend that you make sure it's solvable after at minimum 10 seconds, or users may become annoyed and unfavor it.
			]}
			{rows rel:section id:profile-panel
				{cols
					{rows halign:center
						{head 4 Login}
						{input id:login-username Username}
						{input id:login-password type:password Password}
						{block halign:right [
							{block id:login-time 0.0}
							{button id:login-button
								is:disabled
								class:"fa fa-play"
							}
						]}
					}
					{rows halign:center
						{head 4 Login}
						{input id:login-username Username}
						{input id:login-password type:password Password}
						{block halign:right [
							{block id:register-time 0.0}
							{button id:register-button
								is:disabled
								class:"fa fa-play"
							}
						]}
					}
				}
				{p "Click the play button to start a timer. The time indicates how long you'll have to wait with the right password. Click the stop button to end the timer."}
				{p "With a bad login attempt, the timer won't ever stop. Only you can tell if the password is wrong."}
			}
			{rows rel:section id:search-panel class:active
				{cols
					{cols halign:left
						{button id:search-popular
							class:"option-button fa fa-line-chart"
							tip:Popular
						}
						{button id:search-random
							class:"option-button fa fa-flash"
							tip:Random
						}
						{button id:search-global
							class:"option-button fa fa-globe"
							tip:Global
						}
					}
					{cols halign:right
						{button id:search-grid
							class:"option-button fa fa-th"
							tip:Grid
						}
						{button id:search-list
							class:"option-button fa fa-th-list"
							tip:List
						}
					}
				}
				{block id:search-results}
			}
			{rows id:video-info-panel
				{block class:preference
					"hr51^P[02zMKAOp%$Mw.mj=(2Q7Xbm>OV{WcZ26@4l}!T=$]7mzMavLM.3qeM9u2X.twWjy+7xR-ysK"
				}
				{block class:views 10,000}
				{block class:published "Nov 25, 2015"}
				{block class:cost 10}
				{p "This is a simple description for a video about dolphins or something. Why are cats related? Who knows. These descriptions will be rendered markdown loaded from IPFS.
				{block class:tags "#dolphins #fish #first #public-domain"}
				{block class:license "Creative Commons"}
			section#flag-panel
				p
					button#get-flag Review a flag
					span#get-flag-time 00
					p #[span.cost 1] -> #[span.cost 3]
				#flag-types
					input(type="radio" name="issue" value="sexual")
					| Sexual content
					.more-info.fa.fa-question-sign(title="Pornography and objectionable nudity in general")
					br
					input(type="radio" name="issue" value="child-abuse")
					| Child abuse
					.more-info.fa.fa-question-sign(title="Sexual, predatory, physical, or emotional abuse of children")
					br
					input(type="radio" name="issue" value="violent")
					| Violence
					.more-info.fa.fa-question-sign(title="Displays of excessive violence with no greater merit")
					br
					input(type="radio" name="issue" value="hateful")
					| Hate speech
					.more-info.fa.fa-question-sign(title="Provocations of hatred toward individuals or groups (not criticism)")
					br
					input(type="radio" name="issue" value="dangerous")
					| Dangerous content
					.more-info.fa.fa-question-sign(title="Content which encourages viewers to participate in dangerous activities")
					br
					input(type="radio" name="issue" value="copyright")
					| Copyright
					.more-info.fa.fa-question-sign(title="Misuse of copyrighted material")
				p#flag-fromto #[span.cost#flag-from 1] -> #[span.cost#flag-to 3]
				p
					input#use-timestamp(type="checkbox")
					| Include current timestamp
				p#evidence-bag
					label(for="evidence") Evidence:
					textarea#evidence
				p#no-evidence Providing an explanation for your flag helps reviewers to decide if it's correct more quickly.
				button#submit-flag Submit
